import React from "react";
import { ORIENTATION } from "./constants";
import Ship from "./Ship";

const ShipSelector = ({
  boardState,
  selectedShip,
  setSelectedShip,
  setShipSkeleton,
}) => {
  const groups = Object.entries(boardState).reduce((acc, [id, ship]) => {
    const { size } = ship;
    if (!acc[size]) acc[size] = {};
    acc[size][id] = ship;
    return acc;
  }, {});
  const sortedSizes = Object.keys(groups)
    .map((e) => Number(e))
    .sort((a, b) => b - a);
  return (
    <div className="ship-selector">
      <div>Place your ships on the battelfield</div>
      <br />

      {sortedSizes.map((size) => {
        return (
          <div key={size} className="size-group">
            {Object.entries(groups[size]).map(([id, ship]) => {
              const isUsed = !id.startsWith("unset");
              return (
                <Ship
                  key={id}
                  size={size}
                  orientation={ORIENTATION.HORIZONTAL}
                  id={id}
                  editable={true}
                  selectedShip={selectedShip}
                  setSelectedShip={setSelectedShip}
                  setShipSkeleton={setShipSkeleton}
                  className={`ship-option ${isUsed ? "ship-option-used" : ""}`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
export default ShipSelector;
