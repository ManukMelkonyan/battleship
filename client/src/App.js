import React, { useMemo, useState } from "react";
import BoardEditor from "./BoardEditor";
import { ORIENTATION } from "./constants";
import { ReactComponent as Spinner } from "./Assets/spinner.svg";

const defaultSizeCountMap = {
  4: 1,
  3: 2,
  2: 3,
  1: 4,
};

const getInitialBoardConfig = (sizeCountMap) => {
  const config = {};
  let i = 0;
  for (const key in sizeCountMap) {
    const count = sizeCountMap[key];
    const size = Number(key);
    for (let j = 0; j < count; ++j) {
      const id = `unset:${i}`;
      config[id] = {
        size,
        orientation: ORIENTATION.HORIZONTAL,
      };
      ++i;
    }
  }
  return config;
};

function App() {
  const defaultConfig = useMemo(
    () => getInitialBoardConfig(defaultSizeCountMap),
    []
  );
  const [boardConfig, setBoartConfig] = useState(defaultConfig);
  const [editable, setEditable] = useState(true);
  // const [fetching, setFetching] = useState(false);

  console.log(boardConfig);
  const isBoardReady = useMemo(
    () => Object.keys(boardConfig).every((key) => !key.startsWith("unset")),
    [boardConfig]
  );

  const resetBoard = () => {
    setBoartConfig({ ...defaultConfig });
    setEditable(true);
  };

  return (
    <div>
      <h2
        style={{
          margin: "auto",
          width: "30%",
          textAlign: "center",
        }}
      >
        ⚓ Battleship game ⚓
      </h2>
      <div
        className=""
        style={{
          margin: "auto",
          width: "30%",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="flex-column">
          <BoardEditor
            size={[10, 10]}
            boardConfig={boardConfig}
            setBoardConfig={setBoartConfig}
            editable={editable}
          />
          {/* <Battlefield size={[10, 10]} /> */}
          <div className="control-panel">
            <button onClick={resetBoard}>Reset</button>
            <button
              disabled={!isBoardReady}
              onClick={() => {
                setEditable((isEditable) => !isEditable);
              }}
            >
              {editable ? "Ready" : "Not ready"}
            </button>
            <button
              onClick={() =>
                setBoartConfig({
                  "4:7": {
                    size: 3,
                    orientation: "HORIZONTAL",
                  },
                  "5:1": {
                    size: 2,
                    orientation: "HORIZONTAL",
                  },
                  "0:8": {
                    size: 2,
                    orientation: "HORIZONTAL",
                  },
                  "0:5": {
                    size: 2,
                    orientation: "VERTICAL",
                  },
                  "0:0": {
                    size: 4,
                    orientation: "VERTICAL",
                  },
                  "0:2": {
                    size: 1,
                    orientation: "HORIZONTAL",
                  },
                  "2:2": {
                    size: 1,
                    orientation: "HORIZONTAL",
                  },
                  "2:7": {
                    size: 1,
                    orientation: "HORIZONTAL",
                  },
                  "2:9": {
                    size: 1,
                    orientation: "HORIZONTAL",
                  },
                  "5:4": {
                    size: 3,
                    orientation: "VERTICAL",
                  },
                })
              }
            >
              Randomize
            </button>
          </div>
        </div>
        {isBoardReady && !editable && (
          <div className="control-panel">
            <div>
              {/* <span className="">Find an opponent</span> */}
              <Spinner />
              <button>Find an opponent</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
