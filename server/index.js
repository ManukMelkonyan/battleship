const http = require("http");
const { socketter } = require("socketter");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const { addPlayerSocket } = require("./app/services/dataHolder.service");
const DataHandler = require("./app/dataHandler");

const { PORT } = require("./app/config/constants");


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
