require("dotenv").config();
const http = require("http");
const { socketter } = require("socketter");
const { v4: uuid } = require("uuid");
const { validateMessage } = require("./app/helpers/validator");
const { PORT, BOARD_SIZE, sizeCountMap } = require("./app/config/constants");
const {
  popPlayer,
  pushPlayer,
  addGame,
  removeGame,
  addPlayerSocket,
  getPlayerSocket,
  removePlayerSocket,
} = require("./app/services/dataHolder.service");
const { randomizeFirstPlayer } = require('./app/helpers/utils');

const { messageValidationMiddleware } = require('./app/middlewares');

const server = http.createServer();

const createBoard = (ships = {}) => {};

const createNewGame = (player1, player2) => {
  const gameObj = {
    player1board: new Array(10).fill().map((_) => new Array(10).fill(0)),
  };
};

const validateBoard = (boardConfig = {}) => {
  const shipIds = Array.from(Object.keys());
};

const isBoardConfig = (data) => {
  try {
    const dataObj = JSON.stringify(data);
    if ("boardConfig" in dataObj) {
      return true;
    }
    return;
    return false;
  } catch (e) {
    return false;
  }
};

const waitForBoards = (socket1, socket2) => {
  const handleData = (data) => {
    if (typeof data === "string" && isBoardConfig(data)) {
    }
  };

  const p1 = new Promise((resolve, reject) => {
    socket1.addEventListener("data", (data) => {});
  });

  const p2 = new Promise((resolve, reject) => {
    socket2.addEventListener("data", (data) => {});
  });
};

socketter(server, async (currentSocket) => {
  const currentPlayerId = `player:${uuid()}`;
  addPlayerSocket(currentPlayerId, currentSocket);
  const opponentId = popPlayer();
  if (!opponentId) {
    console.log("There is no one online :(");
    console.log("Adding player to the queue");
    pushPlayer(currentPlayerId);
  } else {
    console.log("Found player for you :D");
    console.log(`Your id    : ${currentPlayerId}`);
    console.log(`Opponent id: ${opponentId}`);
    const opponentSocket =  getPlayerSocket(opponentId);
    const firstPlayer = randomizeFirstPlayer(currentPlayerId, opponentId);
    const gameId = `game:${uuid()}`;

    currentSocket.addEventListener('data', messageValidationMiddleware(currentSocket));
    opponentSocket.addEventListener('data', messageValidationMiddleware(opponentSocket));
    
  }
});

server.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});
