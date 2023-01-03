const Joi = require("joi");
const {
  BOARD_SIZE,
  sizeCountMap,
  ORIENTATION,
  cellState,
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

const isValidCoordinates = (row, col) =>
  row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

const isValidSize = (size) => size in sizeCountMap;

const validateBoardConfig = (boardConfig) => {
  const shipSchema = Joi.object().keys({
    size: Joi.number().integer().strict(),
    orientation: Joi.string().valid(...Object.values(ORIENTATION)),
  });
  const idRe = /^(\d+):(\d+)$/;

  const board = new Array(BOARD_SIZE)
    .fill()
    .map(() =>
      new Array(BOARD_SIZE)
        .fill()
        .map(() => ({ state: cellState.HIDDEN, ship: null }))
    );

  const checkAllNeighbors = (row, col) => {
    for (let i = -1; i <= 1; ++i) {
      for (let j = -1; j <= 1; ++j) {
        const newRow = row + i;
        const newCol = col + j;
        if (!isValidCoordinates(newRow, newCol)) continue;
        if (board[newRow][newCol].ship) {
          return false;
        }
      }
    }
    return true;
  };

  const sizeCounts = Object.keys(sizeCountMap).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
  for (const [key, value] of Object.entries(boardConfig)) {
    if (!idRe.test(key)) {
      return false;
    }
    const [row, col] = key.split(":").map((e) => Number(e));
    const { orientation, size } = value;

    const ship = {
      position: [row, col],
      size,
      orientation,
      health: size,
    };

    if (!isValidCoordinates(row, col));
    if (shipSchema.validate(value).error) return false;
    if (!isValidSize(size));
    if (orientation === ORIENTATION.HORIZONTAL) {
      if (!isValidCoordinates(row, col + size - 1)) return false;
      for (let j = 0; j < size; ++j) {
        if (!checkAllNeighbors(row, col + j)) return false;
      }
      for (let j = 0; j < size; ++j) {
        board[row][col + j].ship = ship;
      }
    } else if (orientation === ORIENTATION.VERTICAL) {
      if (!isValidCoordinates(row + size - 1, col)) return false;
      for (let i = 0; i < size; ++i) {
        if (!checkAllNeighbors(row + i, col)) return false;
      }
      for (let i = 0; i < size; ++i) {
        board[row + i][col].ship = ship;
      }
    }
    sizeCounts[size] += 1;
  }
  const areSizeCountsEqual = Object.entries(sizeCounts).every(
    ([size, count]) => sizeCountMap[size] === count
  );
  if (!areSizeCountsEqual) return false;
  return board;
};

const validateMove = (body, board) => {
  const schema = Joi.object().keys({
    row: Joi.number().integer().strict(),
    col: Joi.number().integer().strict(),
  });
  if (schema.validate(body).error) return false;
  const { row, col } = body;
  if (!isValidCoordinates(row, col)) return false;
  
  return board[row][col].state === cellState.HIDDEN;
};

module.exports = {
  isValidCoordinates,
  validateMove,
  validateMessage,
  validateBoardConfig,
};
