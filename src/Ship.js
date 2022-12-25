import React from "react";
import { ORIENTATION } from "./constants";

const Ship = ({
  size,
  orientation,
  id,
  selectedShip,
  setSelectedShip,
  setShipSkeleton,
  editable = false,
  className = '',
  ...props
}) => {
  const isSelected = id === selectedShip;

  const handleClick = (e) => {
    if (!editable) return;
    setSelectedShip(isSelected ? null : id);
    setShipSkeleton(isSelected ? id : null);
  };
  const classList = [
    `ship`,
    `ship-${orientation === ORIENTATION.VERTICAL ? "vertical" : "horizontal"}`,
    className,
  ];
  if (isSelected) classList.push("ship-selected");

  const classes = classList.join(" ");
  return (
    <div onClick={handleClick} className={classes} {...props}>
      {new Array(size).fill(0).map((_, i) => {
        return <div key={i}></div>;
      })}
    </div>
  );
};

export default Ship;
