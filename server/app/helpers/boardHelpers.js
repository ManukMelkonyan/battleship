const { ORIENTATION, cellState } = require("../config/constants");
const { isValidCoordinates } = require("./validator");

const revealDiagonals = (row, col, board) => {
  const cells = [];
  for (let i of [-1, 1]) {
    for (let j of [-1, 1]) {
      const diagonalRow = row + i;
      const diagonalCol = col + j;
      if (
        isValidCoordinates(diagonalRow, diagonalCol) &&
        board[diagonalRow][diagonalCol].state !== cellState.REVEALED
      ) {
        board[diagonalRow][diagonalCol].state = cellState.REVEALED;
        cells.push({
          row: diagonalRow,
          col: diagonalCol,
          isShip: !!board[diagonalRow][diagonalCol].ship,
        });
      }
    }
  }
  return cells;
};

const revealBoundingBox = (ship, board) => {
  const cells = [];
  const {
    position: [startRow, startCol],
    size,
    orientation,
  } = ship;

  const endRow =
    orientation === ORIENTATION.HORIZONTAL ? startRow + 1 : startRow + size;
  const endCol =
    orientation === ORIENTATION.VERTICAL ? startCol + 1 : startCol + size;

  for (let i = startRow - 1; i <= endRow; ++i) {
    for (let j = startCol - 1; j <= endCol; ++j) {
      if (
        isValidCoordinates(i, j) &&
        board[i][j].state !== cellState.REVEALED
      ) {
        board[i][j].state = cellState.REVEALED;
        cells.push({
          row: i,
          col: j,
          isShip: !!board[i][j].ship,
        });
      }
    }
  }
  return cells;
};

module.exports = {
  revealDiagonals,
  revealBoundingBox,
};
