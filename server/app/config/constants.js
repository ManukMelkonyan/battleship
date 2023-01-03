module.exports = {
  PORT: process.env.SERVER_PORT || 8080,
  BOARD_SIZE: 10,
  ORIENTATION: {
    HORIZONTAL: "HORIZONTAL",
    VERTICAL: "VERTICAL",
  },
  sizeCountMap: {
    4: 1,
    3: 2,
    2: 3,
    1: 4,
  },
  cellState: {
    HIDDEN: 0,
    REVEALED: 1,
  },
};
