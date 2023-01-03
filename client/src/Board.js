import React from "react";

import Cell from "./Cell";

const Board = ({ board, onCellClick, footerText, disabled }) => {
  if (!board) return null;
  const rows = board.map((r, i) => (
    <div key={i} className="row">
      {r.map(({ revealed, isShip }, j) => {
        const id = `${i}:${j}`;
        const classList = [];
        if (isShip) {
          classList.push("ship-cell");
          if (revealed) classList.push("ship-cell-revealed");
        } else {
          if (revealed) classList.push("cell-revealed");
        }
        return (
          <div key={id} className="position-relative">
            <Cell
              className={classList.join(" ")}
              id={id}
              onClick={onCellClick}
              options={{ i, j }}
            />
          </div>
        );
      })}
    </div>
  ));

  return (
    <div className="board">
      <div className={`battlefield ${disabled ? "battlefield-disabled" : ""}`}>
        {rows}
      </div>
      <span>{footerText}</span>
    </div>
  );
};

export default Board;
