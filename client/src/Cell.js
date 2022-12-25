import React from "react";

import "./Battleship.scss";

import './App.scss';

const Cell = ({ options, onMouseOver, onClick, id }) => {
  const handleMouseOver = (e) => {
    onMouseOver(id);
  };
  const handleClick = () => {
    onClick(id);
  }
  return (
    <div
      onMouseOver={handleMouseOver}
      onClick={handleClick}
      className={`cell`}
    >
    </div>
  );
};

export default Cell;
