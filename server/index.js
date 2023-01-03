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
  const boardListener = (data) => {
    currentDataHandler.handleMessage("boardConfig")(data);
    currentSocket.removeEventListener("data", boardListener);
  };

  currentSocket.addEventListener("data", boardListener);
});

server.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});
