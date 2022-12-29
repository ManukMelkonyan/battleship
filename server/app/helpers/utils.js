const randomizeFirstPlayer = (player1, player2) =>
  Math.random() > 0.5 ? player1 : player2;

const getOpponentId = (gameObj, currentPlayerId) => {
  for (const id in gameObj.players) {
    if (id !== currentPlayerId) return id;
  }
  return currentPlayerId;
}

module.exports = {
  randomizeFirstPlayer,
  getOpponentId,
};
