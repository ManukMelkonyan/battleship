const { READY_STATE, cellState, ORIENTATION } = require("../config/constants");
const { getOpponentId } = require("../helpers/utils");
const {
  validateMessage,
  validateBoardConfig,
  validateMove,
  isValidCoordinates,
} = require("../helpers/validator");
const {
  popPlayer,
  pushPlayer,
  createGame,
  removeGame,
  addPlayerSocket,
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

  endGame = (statusCode) => {
    console.trace("end game trace");
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
    console.trace("close trace");
    if (this.gameObj) {
      this.endGame(statusCode);
    } else {
      this.currentSocket.close(statusCode);
    }
  };

  handleMessage = (messageType) => (message) => {
    const { valid, value: messageObj } = validateMessage(message);

    if (!valid || messageType !== messageObj.messageType) {
      console.log("Invalid message", message);
      return this.handleClose(1003);
    }

    console.log("Valid message", { messageType, messageObj });

    if (messageType === "boardConfig") {
      return this.handleBoard(messageObj.body);
    }

    if (messageType === "move") {
      return this.handleMove(messageObj.body);
    }
    console.log("Message is not allowed", messageObj);
    return this.handleClose(1003);
  };

  handleBoard = (body) => {
    const currentBoard = validateBoardConfig(body);
    if (!currentBoard) return this.handleClose(1003);
    const opponent = popPlayer();
    if (!opponent) {
      console.log("There is no one online :(");
      console.log("Adding player to the queue");
      console.log(`Your id    : ${this.currentPlayerId}`);
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

      console.log("Found player for you :D");
      console.log(`Your id    : ${this.currentPlayerId}`);
      console.log(`Opponent id: ${opponentId}`);
      console.log(gameObj);

      this.setGame(gameObj);

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
      this.startGame();
    }

    // const playerObj = this.gameObj.players[this.playerId];
    // playerObj.board = res;
    // playerObj.readyState = READY_STATE.READY;
    // const opponentObj = this.gameObj.players[this.opponetId];
    // if (opponentObj.readyState === READY_STATE.READY) {
    //   this.startGame();
    // }
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
    } else if (currentPlayerReadyState === READY_STATE.CLOSED) {
      this.handleClose(1001);
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
      for (let i of [-1, 1]) {
        for (let j of [-1, 1]) {
          const diagonalRow = row + i;
          const diagonalCol = col + j;
          if (
            isValidCoordinates(diagonalRow, diagonalCol) &&
            board[diagonalRow][diagonalCol].state !== cellState.REVEALED
          ) {
            board[diagonalRow][diagonalCol].state = cellState.REVEALED;
            revealedCells.push({
              row: diagonalRow,
              col: diagonalCol,
              isShip: !!board[diagonalRow][diagonalCol].ship,
            });
          }
        }
      }

      if (ship.health === 0) {
        opponentPlayerObj.shipsLeftCount -= 1;
        const {
          position: [startRow, startCol],
          size,
          orientation,
        } = ship;

        const endRow =
          orientation === ORIENTATION.HORIZONTAL
            ? startRow + 1
            : startRow + size;
        const endCol =
          orientation === ORIENTATION.VERTICAL ? startCol + 1 : startCol + size;

        for (let i = startRow - 1; i <= endRow; ++i) {
          for (let j = startCol - 1; j <= endCol; ++j) {
            if (
              isValidCoordinates(i, j) &&
              board[i][j].state !== cellState.REVEALED
            ) {
              board[i][j].state = cellState.REVEALED;
              revealedCells.push({
                row: i,
                col: j,
                isShip: !!board[i][j].ship,
              });
            }
          }
        }
      }
    }
    console.log('opponentPlayerObj.shipsLeftCount', opponentPlayerObj.shipsLeftCount);

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
    }
  };
}

module.exports = {
  DataHandler,
};
