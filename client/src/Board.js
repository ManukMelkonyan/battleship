import React from "react";

import Cell from "./Cell";

const Board = ({ board, size, onCellClick }) => {
  const [n, m] = size;
  const rows = new Array(n).fill().map((row, i) => {
    return (
      <div key={i} className="row">
        {new Array(m).fill().map((col, j) => {
          const id = `${i}:${j}`;
          return (
            <div key={id} className="position-relative">
              <Cell
                id={id}
                onClick={onCellClick}
                options={{ i, j }}
              />
              
            </div>
          );
        })}
      </div>
    );
  });
  return <div>{rows}</div>;
};

export default Board;
