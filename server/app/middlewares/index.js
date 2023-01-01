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
} = require("../services/dataHolder.service");

class DataHandler {
  constructor(socket, gameObj, playerId) {
    this.socket = socket;
    this.gameObj = gameObj;
    this.playerId = playerId;
    this.opponetId = getOpponentId(gameObj, playerId);
    this.opponetSocket = getPlayerSocket(this.opponetId);
    console.log(this.opponetId, playerId);
  }

  endGame = (statusCode) => {
    console.trace('end game trace');
    this.socket.close(statusCode);
    this.opponetSocket.close(statusCode);
  }

  startGame = () => {
    const isCurrentPlayerTurn = this.gameObj.turn === this.playerId;
    this.socket.sendMessage(
      JSON.stringify({
        messageType: "gameStarted",
        isCurrentPlayerTurn: isCurrentPlayerTurn,
      })
    );
    this.opponetSocket.sendMessage(
      JSON.stringify({
        messageType: "gameStarted",
        isCurrentPlayerTurn: !isCurrentPlayerTurn,
      })
    );
  };

  handleBoard = (body) => {
    const res = validateBoardConfig(body);
    if (!res) this.endGame(1003);
    const playerObj = this.gameObj.players[this.playerId];
    playerObj.board = res;
    playerObj.readyState = READY_STATE.READY;
    const opponentObj = this.gameObj.players[this.opponetId];
    if (opponentObj.readyState === READY_STATE.READY) {
      startGame();
    }
  };

  handleMove = (body) => {
    const { board } = this.gameObj.players[this.playerId];
    if (!validateMove(body, board)) this.endGame();
  };

  handleMessage = (message) => {
    const { valid, value: messageObj } = validateMessage(message);

    if (!valid) {
      // return console.log("Invalid message", message);
      return this.endGame(1003);
    }
    const { messageType, body } = messageObj;
    console.log("Valid message", { messageType, body });

    const currentPlayerReadyState = this.gameObj.players[this.playerId].readyState;
    const isCurrentPlayerTurn = this.gameObj.turn === this.playerId;
    if (
      messageType === "boardConfig" &&
      currentPlayerReadyState === READY_STATE.PENDING_BOARD
    ) {
      this.handleBoard(body);
    } else if (
      messageType === "move" &&
      currentPlayerReadyState === READY_STATE.READY &&
      isCurrentPlayerTurn
    ) {
      this.handleMove(body);
    } else if (currentPlayerReadyState === READY_STATE.CLOSED) {
      this.endGame(1001);
    } else {
      this.endGame(1003);
    }
  };
}

module.exports = {
  DataHandler,
};
