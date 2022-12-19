import React from "react";
import "./Battleship.scss";
import Cell from "./Cell";

const shipTypes = {
  aircraft: {
    size: 5,
  },
  battleship: {
    size: 4,
  },
  submarine: {
    size: 3,
  },
  cruiser: {
    size: 3,
  },
  destroyer: {
    size: 2,
  },
};
const Battlefield = ({
  size,
  boardConfig = {
    aircraft: {
      cells: [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
      ],
    },
    battleship: {
      cells: [
        [3, 2],
        [4, 2],
        [5, 2],
        [6, 2],
      ],
    },
    submarine: {
      cells: [
        [5, 6],
        [5, 7],
        [5, 8],
      ],
    },
    cruiser: {
      cells: [
        [7, 8],
        [8, 8],
        [9, 8],
      ],
    },
    destroyer: {
      cells: [
        [1, 9],
        [2, 9],
      ],
    },
  },
}) => {
  const [n, m] = size;
  const board = new Array(n).fill().map(() => new Array(m).fill(0));
  for (const ship in boardConfig) {
    for (const [i, j] of boardConfig[ship].cells) {
      board[i][j] = 1;
    }
  }
  console.log(board);
  const rows = new Array(n).fill().map((row, i) => {
    return (
      <div key={i} className="row">
        {new Array(m).fill().map((col, j) => {
          return (
            <Cell
              key={`${i},${j}`}
              options={{ i, j, isShipCell: board[i][j] }}
            />
          );
        })}
      </div>
    );
  });

  return <div className="battlefield">{rows}</div>;
};

export default Battlefield;
