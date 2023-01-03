import React from "react";

import "./Battleship.scss";

import "./App.scss";

const Cell = ({ className, onMouseOver, onClick, id }) => {
  const handleMouseOver = (e) => {
    onMouseOver && onMouseOver(id);
  };
  const handleClick = () => {
    onClick && onClick(id);
  };
  return (
    <div
      onMouseOver={handleMouseOver}
      onClick={handleClick}
      className={`cell ${className}`}
    ></div>
  );
};

export default Cell;
