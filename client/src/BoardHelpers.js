const { BOARD_SIZE, ORIENTATION, sizeCountMap } = require("./constants");

export const constructConfigFromCells = (cells) => {
  const boardConfig = {};
  const visited = new Array(BOARD_SIZE)
    .fill()
    .map(() => new Array(BOARD_SIZE).fill(0));
  for (let i = 0; i < cells.length; ++i) {
    for (let j = 0; j < cells[0].length; ++j) {
      if (visited[i][j]) continue;
      if (cells[i][j]) {
        let size = 0;
        let orientation = "";
        let lastRow = i;
        let lastCol = j;
        if (cells[i][j + 1]) {
          orientation = "HORIZONTAL";
          for (let col = j; col < BOARD_SIZE && cells[i][col] !== 0; ++col) {
            lastCol = col;
            size++;
            visited[i][col] = 1;
            if (i + 1 < BOARD_SIZE) {
              visited[i + 1][col] = 1;
            }
          }
        } else {
          orientation = "VERTICAL";
          for (let row = i; row < BOARD_SIZE && cells[row][j] !== 0; ++row) {
            lastRow = row;
            size++;
            visited[row][j] = 1;
            if (j + 1 < BOARD_SIZE) {
              visited[row][j + 1] = 1;
            }
          }
        }

        if (lastRow + 1 < BOARD_SIZE) {
          visited[lastRow + 1][lastCol] = 1;
        }
        if (lastCol + 1 < BOARD_SIZE) {
          visited[i][lastCol + 1] = 1;
        }
        if (lastRow + 1 < BOARD_SIZE && lastCol + 1 < BOARD_SIZE) {
          visited[lastRow][lastCol] = 1;
        }
        boardConfig[`${i}:${j}`] = {
          size,
          orientation,
        };
      }
    }
  }
  return boardConfig;
}

export function generateBoard() {
  // Create an empty board
  const board = new Array(10).fill().map(() => new Array(10).fill(0));

  const placeShip = (size, row, col, orientation) => {
    if (orientation === 'HORIZONTAL') {
      for (let j = col; j < col + size; ++j) {
        board[row][j] = 1;
      }
    } else {
      for (let i = row; i < row + size; ++i) {
            board[i][col] = 1;
      }
    }
  }

  const isValidPosition = (size, row, col, orientation) => {
    if (orientation === 'HORIZONTAL') {
      if (col + size > 10) return false;
      for (let i = row - 1; i <= row + 1; ++i) {
        for (let j = col - 1; j <= col + size; ++j) {
          if (i < 0 || j < 0 || i >= 10 || j >= 10) continue;
          if (board[i][j] === 1) return false;
        }
      }
      return true;
    } else {
      if (row + size > 10) return false;
      for (let i = row - 1; i <= row + size; ++i) {
        for (let j = col - 1; j <= col + 1; ++j) {
          if (i < 0 || j < 0 || i >= 10 || j >= 10) continue;
          if (board[i][j] === 1) return false;
        }
      }
      return true;
    }
    
  };

  const getAllValidPositions = (size) => {
    const validPositions = [];
    for (let i = 0; i < 10; ++i) {
      for (let j = 0; j < 10; ++j) {
        for (const orientation of ['HORIZONTAL', 'VERTICAL']) {
          const position = { row: i, col: j, orientation };
          if (isValidPosition(size, i, j, orientation)) {
            validPositions.push(position);
          }
        }
      }
    }
    return validPositions;
  };

  for (const key in sizeCountMap) {
    const size = Number(key);
    const count = sizeCountMap[key];
    for (let i = 0; i < count; ++i) {
      const allValidPositions = getAllValidPositions(size);
      const randomPosition = allValidPositions[Math.floor(Math.random() * allValidPositions.length)];
      const { row, col, orientation } = randomPosition;
      placeShip(size, row, col, orientation);
    }
  }
  return board;
}

export const getBoardCells = (boardConfig) => {
  const board = new Array(BOARD_SIZE)
    .fill()
    .map(() =>
      new Array(BOARD_SIZE)
        .fill()
        .map(() => ({ revealed: false, isShip: false }))
    );

  for (const [key, value] of Object.entries(boardConfig)) {
    const [row, col] = key.split(":").map((e) => Number(e));
    const { size, orientation } = value;
    if (orientation === ORIENTATION.HORIZONTAL) {
      for (let j = 0; j < size; ++j) {
        board[row][col + j].isShip = true;
      }
    } else if (orientation === ORIENTATION.VERTICAL) {
      for (let i = 0; i < size; ++i) {
        board[row + i][col].isShip = true;
      }
    }
  }
  return board;
};

export const getInitialBoardConfig = (sizeCountMap) => {
  const config = {};
  let i = 0;
  for (const key in sizeCountMap) {
    const count = sizeCountMap[key];
    const size = Number(key);
    for (let j = 0; j < count; ++j) {
      const id = `unset:${i}`;
      config[id] = {
        size,
        orientation: ORIENTATION.HORIZONTAL,
      };
      ++i;
    }
  }
  return config;
};