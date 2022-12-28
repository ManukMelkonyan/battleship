const randomizeFirstPlayer = (player1, player2) =>
  Math.random() > 0.5 ? player1 : player2;

module.exports = {
  randomizeFirstPlayer,
};
