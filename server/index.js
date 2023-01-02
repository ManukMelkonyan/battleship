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
  removePlayer,
  addPlayerSocket,
  getPlayerSocket,
  removePlayerSocket,
} = require("./app/services/dataHolder.service");

const { DataHandler } = require("./app/middlewares");

const server = http.createServer();

socketter(server, async (currentSocket) => {
  const currentPlayerId = `player:${uuid()}`;
  addPlayerSocket(currentPlayerId, currentSocket);
  
  const currentDataHandler = new DataHandler(currentSocket, currentPlayerId);
  // return currentSocket.close(1000);
  const boardListener = currentDataHandler.handleMessage('boardConfig');
  
  currentSocket.addEventListener("data", (data) => {
    boardListener(data);
    currentSocket.removeEventListener('data', boardListener);
  });
  
  // const opponentId = popPlayer();
  // if (!opponentId) {
  //   console.log("There is no one online :(");
  //   console.log("Adding player to the queue");
  //   console.log(`Your id    : ${currentPlayerId}`);
  //   pushPlayer(currentPlayerId);
  //   currentSocket.addEventListener("close", () => {
  //     removePlayer(currentPlayerId);
  //   });
  // } else {
  //   const opponentSocket = getPlayerSocket(opponentId);
  //   const gameObj = createGame({
  //     p1: { id: currentPlayerId, socket: currentSocket },
  //     p2: { id: opponentId, socket: opponentSocket },
  //   });

  //   console.log("Found player for you :D");
  //   console.log(`Your id    : ${currentPlayerId}`);
  //   console.log(`Opponent id: ${opponentId}`);
  //   console.log(gameObj);

  //   const currentDataHandler = new DataHandler(
  //     currentSocket,
  //     currentPlayerId,
  //     gameObj
  //   );
  //   const opponentDataHandler = new DataHandler(
  //     opponentSocket,
  //     opponentId,
  //     gameObj
  //   );
  //   currentSocket.addEventListener("data", currentDataHandler.handleMove);
  //   opponentSocket.addEventListener("data", opponentDataHandler.handleMove);
  // }
});

server.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});
