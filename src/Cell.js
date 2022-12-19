import React from "react";
import './Battleship.scss';


const Cell = ({ options }) => {
  const { i, j, isShipCell } = options;
  return  (
    <div className={`cell ${isShipCell ? 'ship' : ''}`}>
      {/* {i},{j} */}
    </div>
  )
};

export default Cell;