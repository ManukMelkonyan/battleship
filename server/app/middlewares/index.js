const { READY_STATE } = require("../config/constants");
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
  addPlayerSocket,
  getPlayerSocket,
  removePlayerSocket,
  removePlayer,
} = require("../services/dataHolder.service");

class DataHandler {
  currentPlayerId;
  currentSocket;
  gameObj;
  opponetId;
  opponentSocket;

  constructor(socket, playerId, gameObj = null) {
    this.currentSocket = socket;
    this.currentPlayerId = playerId;
    this.gameObj = gameObj;
    if (gameObj) {
      this.opponetId = getOpponentId(gameObj, playerId);
      this.opponentSocket = getPlayerSocket(this.opponetId);
    }
  }

  setGame = (gameObj) => {
    this.opponetId = getOpponentId(gameObj, this.currentPlayerId);
    this.opponentSocket = getPlayerSocket(this.opponetId);
  };

  endGame = (statusCode) => {
    console.trace("end game trace");
    this.currentSocket.close(statusCode);
    this.opponentSocket.close(statusCode);
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
    // console.log(statusCode, this.gameObj);
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
    console.log(body);
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

      this.opponetId = opponentId;
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

  handleMove = (message) => {
    const { valid, value: messageObj } = validateMessage(message);

    if (!valid) {
      // return console.log("Invalid message", message);
      return this.endGame(1003);
    }
    const { body } = messageObj;

    const currentPlayerReadyState =
      this.gameObj.players[this.currentPlayerId].readyState;
    const isCurrentPlayerTurn = this.gameObj.turn === this.currentPlayerId;
    if (currentPlayerReadyState === READY_STATE.READY && isCurrentPlayerTurn) {
      // this.handleMove(body);
      const { board } = this.gameObj.players[this.currentPlayerId];

      if (!validateMove(body, board)) this.endGame();
    } else if (currentPlayerReadyState === READY_STATE.CLOSED) {
      this.handleClose(1001);
    } else {
      this.handleClose(1003);
    }
  };
}

module.exports = {
  DataHandler,
};
