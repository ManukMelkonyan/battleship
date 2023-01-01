const Joi = require("joi");
const {
  BOARD_SIZE,
  sizeCountMap,
  ORIENTATION,
} = require("../config/constants");

const validateMessage = (message) => {
  if (typeof message !== "string") return { valid: false };
  try {
    const dataJson = JSON.parse(message);
    const schema = Joi.object().keys({
      messageType: Joi.string().valid("boardConfig", "move").required(),
      body: Joi.object().required(),
    });
    const { error, value } = schema.validate(dataJson);
    if (error) return { valid: false };
    return { valid: true, value };
  } catch {
    return { valid: false };
  }
};

// const validateBoard = (boardConfig = {}) => {
//   const shipIds = Array.from(Object.keys());
// };

const isValidCoordinates = (row, col) =>
  row >= 0 && row < BOARD_SIZE && col >= 0 && col <= BOARD_SIZE;

const isValidSize = (size) => size in sizeCountMap;

const validateBoardConfig = (boardConfig) => {
  const shipSchema = Joi.object().keys({
    size: Joi.number().integer().strict(),
    orientation: Joi.string().valid(...Object.values(ORIENTATION)),
  });
  const idRe = /^\d:\d$/g;

  const board = new Array(BOARD_SIZE)
    .fill()
    .map((_) => new Array(BOARD_SIZE).fill(0));

  const checkAllNeighbors = (row, col) => {
    for (let i = -1; i <= 1; ++i) {
      for (let j = -1; j <= 1; ++j) {
        const newRow = row + i;
        const newCol = col + j;
        if (!isValidCoordinates(newRow, newCol)) continue;
        if (board[newRow][newCol]) {
          return false;
        }
      }
    }
    return true;
  };

  const isPositionFree = (row, col, size) => {};

  const sizeCounts = Object.keys(sizeCountMap).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
  for (const [key, value] of Object.entries(boardConfig)) {
    if (!idRe.test(key)) return false;
    const [row, col] = key.split(":").map((e) => Number(e));
    if (!isValidCoordinates(row, col));
    if (shipSchema.validate(value).error) return false;
    const { orientation, size } = value;
    if (!isValidSize(size));
    if (orientation === ORIENTATION.HORIZONTAL) {
      if (!isValidCoordinates(row, col + size - 1)) return false;
      for (let j = 0; j < size; ++j) {
        // this is wrong cause when you fill a cell it's being checked by the 'checkAllNeighbors' and it aborts as it's busy cell
        if (!checkAllNeighbors(row, col + j)) return false;
        board[row][col + j] = 1;
      }
    } else if (orientation === ORIENTATION.VERTICAL) {
      if (!isValidCoordinates(row + size - 1, col)) return false;
      for (let i = 0; i < size; ++i) {
        // this is wrong cause when you fill a cell it's being checked by the 'checkAllNeighbors' and it aborts as it's busy cell
        if (!checkAllNeighbors(row + i, col)) return false;
        board[row + 1][col] = 1;
      }
    }
    sizeCounts[size] += 1;
  }
  const areSizeCountsEqual = Object.entries(sizeCounts).every(
    ([size, count]) => sizeCountMap[size] === count
  );
  if (areSizeCountsEqual) return false;
  return board;
};

const validateMove = (body, board) => {
  const schema = Joi.object().keys({
    row: Joi.number().integer().strict(),
    col: Joi.number().integer().strict(),
  });
  if (schema.validate(body)) return false;
  const { row, col } = body;
  return board[row][col] === 0;
}

module.exports = {
  validateMove,
  validateMessage,
  validateBoardConfig,
};
