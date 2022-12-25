import React from "react";
import { ORIENTATION } from "./constants";

const getOrientation = (orientation, rotating) => {
  if (rotating) {
    return orientation === ORIENTATION.VERTICAL ? "horizontal" : "vertical";
  }
  return orientation === ORIENTATION.VERTICAL ? "vertical" : "horizontal";
};

const ShipSkeleton = ({
  size,
  orientation,
  isValid,
  rotating = false,
  ...props
}) => {
  const classList = [
    `ship`,
    `ship-skeleton`,
    `ship-${getOrientation(orientation, rotating)}`,
  ];
  if (!isValid) classList.push("ship-skeleton-invalid");

  const className = classList.join(" ");
  return (
    <div
      onMouseOver={(e) => e.preventDefault()}
      className={className}
      {...props}
    >
      {new Array(size).fill(0).map((_, i) => {
        return <div key={i}></div>;
      })}
    </div>
  );
};

export default ShipSkeleton;
