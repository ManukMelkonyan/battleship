const { v4: uuid } = require("uuid");
const { READY_STATE } = require("../config/constants");

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

const popPlayer = () => {
  return playersQueue.shift();
};

const pushPlayer = (id) => {
  return playersQueue.push(id);
};

const createGame = ({ p1, p2 }) => {
  const firstPlayer = randomizeFirstPlayer(p1.id, p2.id);
  const gameId = `game:${uuid()}`;
  const game = {
    turn: firstPlayer,
    id: gameId,
    players: {
      [p1.id]: {
        socket: p1.socket,
        board: null,
        readyState: READY_STATE.PENDING_BOARD,
      },
      [p2.id]: {
        socket: p2.socket,
        board: null,
        readyState: READY_STATE.PENDING_BOARD,
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
};
