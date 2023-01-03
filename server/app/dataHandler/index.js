const { cellState } = require("../config/constants");
const {
  revealBoundingBox,
  revealDiagonals,
} = require("../helpers/boardHelpers");
const { getOpponentId } = require("../helpers/utils");
const {
  validateMessage,
  validateBoardConfig,
  validateMove,
} = require("../helpers/validator");
const {
  popPlayer,
  pushPlayer,
  createGame,
  removeGame,
  getPlayerSocket,
  removePlayerSocket,
  removePlayer,
} = require("../services/dataHolder.service");

class DataHandler {
  currentPlayerId;
  currentSocket;
  gameObj;
  opponentId;
  opponentSocket;

  constructor(socket, playerId, gameObj = null) {
    this.currentSocket = socket;
    this.currentPlayerId = playerId;
    this.gameObj = gameObj;
    if (gameObj) {
      this.opponentId = getOpponentId(gameObj, playerId);
      this.opponentSocket = getPlayerSocket(this.opponentId);
    }
  }

  setGame = (gameObj) => {
    this.opponentId = getOpponentId(gameObj, this.currentPlayerId);
    this.opponentSocket = getPlayerSocket(this.opponentId);
  };

  endGame = (statusCode = 1000) => {
    this.currentSocket.close(statusCode);
    this.opponentSocket.close(statusCode);

    removeGame(this.gameObj.id);
    removePlayerSocket(this.currentPlayerId);
    removePlayerSocket(this.opponentSocket);
  };

  broadcastMessages = (currentMessageObj, opponentMessageObj) => {
    if (this.currentSocket && typeof currentMessageObj === "object") {
      this.currentSocket.sendMessage(JSON.stringify(currentMessageObj));
    }

    if (this.opponentSocket && typeof opponentMessageObj === "object") {
      this.opponentSocket.sendMessage(JSON.stringify(opponentMessageObj));
    }
  };

  startGame = () => {
    const isCurrentPlayerTurn = this.gameObj.turn === this.currentPlayerId;
    this.broadcastMessages(
      {
        messageType: "gameStart",
        body: { isCurrentPlayerTurn: isCurrentPlayerTurn },
      },
      {
        messageType: "gameStart",
        body: { isCurrentPlayerTurn: !isCurrentPlayerTurn },
      }
    );
  };

  handleClose = (statusCode) => {
    if (this.gameObj) {
      this.endGame(statusCode);
    } else {
      this.currentSocket.close(statusCode);
    }
  };

  handleMessage = (messageType) => (message) => {
    const { valid, value: messageObj } = validateMessage(message);

    if (!valid || messageType !== messageObj.messageType) {
      return this.handleClose(1003);
    }

    if (messageType === "boardConfig") {
      return this.handleBoard(messageObj.body);
    }

    if (messageType === "move") {
      return this.handleMove(messageObj.body);
    }
    return this.handleClose(1003);
  };

  handleBoard = (body) => {
    const currentBoard = validateBoardConfig(body);
    if (!currentBoard) return this.handleClose(1003);
    const opponent = popPlayer();
    if (!opponent) {
      pushPlayer(this.currentPlayerId, currentBoard);
      this.currentSocket.addEventListener("close", () => {
        removePlayer(this.currentPlayerId);
      });
    } else {
      const { id: opponentId, board: opponentBoard } = opponent;
      const opponentSocket = getPlayerSocket(opponentId);

      const gameObj = createGame({
        p1: {
          id: this.currentPlayerId,
          socket: this.currentSocket,
          board: currentBoard,
        },
        p2: { id: opponentId, socket: opponentSocket, board: opponentBoard },
      });

      this.opponentId = opponentId;
      this.opponentSocket = opponentSocket;
      this.gameObj = gameObj;

      const opponentDataHandler = new DataHandler(
        opponentSocket,
        opponentId,
        gameObj
      );
      this.currentSocket.addEventListener("data", this.handleMessage("move"));
      this.opponentSocket.addEventListener(
        "data",
        opponentDataHandler.handleMessage("move")
      );

      this.currentSocket.addEventListener("close", (statusCode) => {
        this.endGame(statusCode);
      });
      this.opponentSocket.addEventListener("close", (statusCode) => {
        this.endGame(statusCode);
      });

      this.startGame();
    }
  };

  handleMove = (body) => {
    const currentPlayerReadyState =
      this.gameObj.players[this.currentPlayerId].readyState;
    const isCurrentPlayerTurn = this.gameObj.turn === this.currentPlayerId;
    if (isCurrentPlayerTurn) {
      const opponentPlayerObj = this.gameObj.players[this.opponentId];
      const { board: opponentBoard } = opponentPlayerObj;
      if (!validateMove(body, opponentBoard)) return this.handleClose(1003);

      this.consumeMove(body, opponentPlayerObj);
    } else {
      this.handleClose(1003);
    }
  };

  consumeMove = (body, opponentPlayerObj) => {
    const { row, col } = body;

    const { board } = opponentPlayerObj;

    board[row][col].state = cellState.REVEALED;

    const { ship } = board[row][col];
    const revealedCells = [{ row, col, isShip: !!ship }];

    let isCurrentPlayerTurn = false;

    if (ship) {
      isCurrentPlayerTurn = true;
      ship.health -= 1;
      const revealedDiagonalCells = revealDiagonals(row, col, board);
      revealedCells.push(...revealedDiagonalCells);
      if (ship.health === 0) {
        opponentPlayerObj.shipsLeftCount -= 1;
        const revealedBoundingBoxCells = revealBoundingBox(ship, board);
        revealedCells.push(...revealedBoundingBoxCells);
      }
    }

    this.gameObj.turn = isCurrentPlayerTurn
      ? this.currentPlayerId
      : this.opponentId;

    this.broadcastMessages(
      {
        messageType: "reveal",
        body: {
          isCurrentPlayerTurn,
          isCurrentBoard: false,
          revealedCells,
        },
      },
      {
        messageType: "reveal",
        body: {
          isCurrentPlayerTurn: !isCurrentPlayerTurn,
          revealedCells,
          isCurrentBoard: true,
        },
      }
    );

    if (opponentPlayerObj.shipsLeftCount === 0) {
      this.broadcastMessages(
        {
          messageType: "gameOver",
          body: {
            isWinner: true,
          },
        },
        {
          messageType: "gameOver",
          body: {
            isWinner: false,
          },
        }
      );
      this.endGame(1000);
    }
  };
}

module.exports = DataHandler;
