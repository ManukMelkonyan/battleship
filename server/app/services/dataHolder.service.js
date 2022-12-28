const playersQueue = [];
const playerIdSocketMap = {};
const games = {};

const addPlayerSocket = (id, socket) => {
  playerIdSocketMap[id] = socket;
};

const getPlayerSocket = (id) => playerIdSocketMap[id];

const removePlayerSocket = (id) => {
  delete playerIdSocketMap[id];
};

const popPlayer = () => {
  return playersQueue.unshift();
};

const pushPlayer = (id) => {
  return playersQueue.push();
};

const addGame = (id, gameObj) => {

};

const removeGame = (id) => {
  delete games[id];
}


module.exports = {
  popPlayer,
  pushPlayer,
  addGame,
  removeGame,
  addPlayerSocket,
  getPlayerSocket,
  removePlayerSocket,
}