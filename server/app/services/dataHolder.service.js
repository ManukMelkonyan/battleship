const { v4: uuid } = require("uuid");
const { READY_STATE, sizeCountMap } = require("../config/constants");

const { randomizeFirstPlayer } = require("../helpers/utils");

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

const removePlayer = (id) => {
  const index = playersQueue.findIndex(({ id: currentId }) => currentId === id);
  if (index !== -1) {
    playersQueue.splice(index);
  }
};

const popPlayer = () => {
  return playersQueue.shift();
};

const pushPlayer = (id, board) => {
  return playersQueue.push({ id, board });
};

const createGame = ({ p1, p2 }) => {
  const shipCount = Object.values(sizeCountMap).reduce(
    (total, cnt) => total + cnt,
    0
  );
  const firstPlayer = randomizeFirstPlayer(p1.id, p2.id);
  const gameId = `game:${uuid()}`;
  const game = {
    turn: firstPlayer,
    id: gameId,
    players: {
      [p1.id]: {
        socket: p1.socket,
        board: p1.board,
        readyState: READY_STATE.PENDING_BOARD,
        shipsLeftCount: shipCount,
      },
      [p2.id]: {
        socket: p2.socket,
        board: p2.board,
        readyState: READY_STATE.PENDING_BOARD,
        shipsLeftCount: shipCount,
      },
    },
  };
  games[gameId] = game;
  return game;
};

const removeGame = (id) => {
  delete games[id];
};

module.exports = {
  popPlayer,
  pushPlayer,
  createGame,
  removeGame,
  addPlayerSocket,
  getPlayerSocket,
  removePlayerSocket,
  removePlayer,
};
