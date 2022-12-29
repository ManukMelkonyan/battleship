require("dotenv").config();
const http = require("http");
const { socketter } = require("socketter");
const { v4: uuid } = require("uuid");
const { validateMessage } = require("./app/helpers/validator");
const { PORT, BOARD_SIZE, sizeCountMap } = require("./app/config/constants");
const {
  popPlayer,
  pushPlayer,
  createGame,
  removeGame,
  addPlayerSocket,
  getPlayerSocket,
  removePlayerSocket,
} = require("./app/services/dataHolder.service");

const { DataHandler } = require("./app/middlewares");

const server = http.createServer();

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
    const opponentSocket = getPlayerSocket(opponentId);
    const gameObj = createGame({
      p1: { id: currentPlayerId, socket: currentSocket },
      p2: { id: opponentId, socket: opponentSocket },
    });
    console.log(gameObj);

    const currentDataHandler = new DataHandler(
      currentSocket,
      gameObj,
      currentPlayerId
    );
    const opponentDataHandler = new DataHandler(
      currentSocket,
      gameObj,
      currentPlayerId
    );

    currentSocket.addEventListener("data", currentDataHandler.handleMessage);
    opponentSocket.addEventListener("data", opponentDataHandler.handleMessage);
  }
});

server.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});
