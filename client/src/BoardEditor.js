import React, { useEffect, useMemo, useState } from "react";

import Cell from "./Cell";
import Ship from "./Ship";
import ShipSelector from "./ShipSelector";

import "./Battleship.scss";

import { ORIENTATION } from "./constants";
import ShipSkeleton from "./ShipSkeleton";

const BoardEditor = ({
  isEditing = true,
  size,
  boardConfig,
  setBoardConfig,
}) => {
  const [n, m] = size;
  const [selectedShip, setSelectedShip] = useState(null);
  const [rotating, setRotating] = useState(false);
  const [shipSkeleton, setShipSkeleton] = useState(null);

  const boardCells = useMemo(() => {
    const board = new Array(n).fill().map(() => new Array(m).fill(0));
    Object.keys(boardConfig)
      .filter((id) => id !== selectedShip && !id.startsWith("unset"))
      .forEach((id) => {
        const ship = boardConfig[id];
        const [startRow, startCol] = id.split(":").map((e) => Number(e));
        if (ship.orientation === ORIENTATION.HORIZONTAL) {
          for (let j = 0; j < ship.size; ++j) {
            board[startRow][startCol + j] = 1;
          }
        } else if (ship.orientation === ORIENTATION.VERTICAL) {
          for (let i = 0; i < ship.size; ++i) {
            board[startRow + i][startCol] = 1;
          }
        }
      });
    return board;
  }, [boardConfig, selectedShip, n, m]);
  const placeShip = (shipId) => {
    const oldShip = { ...boardConfig[selectedShip] };
    delete boardConfig[selectedShip];
    boardConfig[shipId] = oldShip;
    if (rotating) {
      boardConfig[shipId].orientation =
        boardConfig[shipId].orientation === ORIENTATION.HORIZONTAL
          ? ORIENTATION.VERTICAL
          : ORIENTATION.HORIZONTAL;
    }
    setBoardConfig({ ...boardConfig });
    setShipSkeleton(null);
    setSelectedShip(null);
    setRotating(false);
  };
  const isValidShipPoisition = (shipId) => {
    const shipObj = boardConfig[selectedShip];
    const [startRow, startCol] = shipId.split(":").map((e) => Number(e));

    const isValidRow = (row) => row >= 0 && row < n;
    const isValidCol = (col) => col >= 0 && col < m;
    const orientation = rotating
      ? shipObj.orientation === ORIENTATION.HORIZONTAL
        ? ORIENTATION.VERTICAL
        : ORIENTATION.HORIZONTAL
      : shipObj.orientation;

    if (!isValidRow(startRow) || !isValidCol(startCol)) return false;

    const checkAllNeighbors = (row, col) => {
      for (let i = -1; i <= 1; ++i) {
        for (let j = -1; j <= 1; ++j) {
          const newRow = row + i;
          const newCol = col + j;
          if (!isValidRow(newRow) || !isValidCol(newCol)) continue;
          if (boardCells[newRow][newCol]) {
            return false;
          }
        }
      }
      return true;
    };

    const shipObjectCells = [];
    if (orientation === ORIENTATION.HORIZONTAL) {
      for (let j = 0; j < shipObj.size; ++j) {
        const nextCol = startCol + j;
        if (!isValidCol(nextCol)) return false;
        shipObjectCells.push([startRow, nextCol]);
      }
    } else if (orientation === ORIENTATION.VERTICAL) {
      for (let i = 0; i < shipObj.size; ++i) {
        const nextRow = startRow + i;
        if (!isValidRow(nextRow)) return false;
        shipObjectCells.push([nextRow, startCol]);
      }
    }

    return shipObjectCells.every(([i, j]) => {
      return checkAllNeighbors(i, j);
    });
  };
  const rows = new Array(n).fill().map((row, i) => {
    return (
      <div key={i} className="row">
        {new Array(m).fill().map((col, j) => {
          const id = `${i}:${j}`;
          return (
            <div key={id} className="position-relative">
              <Cell
                id={id}
                onMouseOver={(id) => {
                  if (!isEditing) return;
                  if (selectedShip) {
                    setShipSkeleton(id);
                  }
                }}
                onClick={(id) => {
                  if (!isEditing) return;
                  if (selectedShip && isValidShipPoisition(id)) {
                    placeShip(id);
                  }
                }}
                options={{ i, j }}
              />
              {selectedShip !== id && boardConfig[id] && (
                <Ship
                  id={id}
                  editable={isEditing}
                  selectedShip={selectedShip}
                  setSelectedShip={setSelectedShip}
                  setShipSkeleton={setShipSkeleton}
                  size={boardConfig[id].size}
                  orientation={boardConfig[id].orientation}
                />
              )}

              {selectedShip && id === shipSkeleton && (
                <ShipSkeleton
                  id={id}
                  rotating={rotating}
                  size={boardConfig[selectedShip].size}
                  orientation={boardConfig[selectedShip].orientation}
                  isValid={isValidShipPoisition(id)}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  });

  useEffect(() => {
    const keyDownListener = (e) => {
      if (e.code === "KeyR" && selectedShip) {
        setRotating((rotating) => !rotating);
      }
    };
    document.addEventListener("keydown", keyDownListener);
    return () => {
      document.removeEventListener("keydown", keyDownListener);
    };
  }, [selectedShip]);

  return (
    <div className="flex-center">
      {isEditing && (
        <ShipSelector
          boardState={boardConfig}
          selectedShip={selectedShip}
          setSelectedShip={setSelectedShip}
          setShipSkeleton={setShipSkeleton}
        />
      )}
      <div className="battlefield">{rows}</div>
    </div>
  );
};

export default BoardEditor;
