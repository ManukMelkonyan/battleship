import React, { useEffect, useMemo, useState } from "react";

import Board from "./Board";
import BoardEditor from "./BoardEditor";

import { ORIENTATION, BOARD_SIZE } from "./constants";

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
  const [connecting, setConnecting] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isCurrentTurn, setIsCurrentTurn] = useState(false);

  const sendMessage = (message) => {
    const stringifiedMessage =
      typeof message === "object"
        ? JSON.stringify(message)
        : message.toString();
    webSocket.send(stringifiedMessage);
  };

  const hadnleReveal = (body) => {};

  const handleGameStart = (body) => {};

  const handleGameOver = (body) => {};

  const handleGameAbort = (body) => {};

  const handleMessage = (message) => {
    try {
      console.log(message);
      const messageObj = JSON.parse(message);
      const { messageType, body } = messageObj;
      if (messageType === "reveal") {
        hadnleReveal(body);
      } else if (messageType === "gameStart") {
        handleGameStart(body);
      } else if (messageType === "gameOver") {
        handleGameOver(body);
      } else if (messageType === "gameAbort") {
        handleGameAbort(body);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const connectToServer = () => {
    setConnecting(true);
    const ws = new WebSocket("ws://localhost:8080");
    setWebSocket(ws);
  };

  useEffect(() => {
    if (!webSocket) return;
    webSocket.onopen = () => {
      sendMessage({
        messageType: "boardConfig",
        body: boardConfig,
      });
    };
    webSocket.onmessage = ({ data }) => {
      handleMessage(data);
    };

    webSocket.onclose = () => {
      setWebSocket(null);
      setConnecting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webSocket]);

  const abortConnection = () => {
    if (webSocket) {
      webSocket.close();
      setWebSocket(null);
      setConnecting(false);
    }
  };

  const handlePlayerPickerClick = () => {
    if (connecting) {
      abortConnection();
    } else {
      connectToServer();
    }
  };

  // console.log(boardConfig);
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
        {editable ? (
          <BoardEditor
            size={[BOARD_SIZE, BOARD_SIZE]}
            boardConfig={boardConfig}
            setBoardConfig={setBoartConfig}
            editable={editable}
          />
        ) : (
          <Board size={[BOARD_SIZE, BOARD_SIZE]} />
        )}
        {isBoardReady && !editable && (
          <div className="control-panel">
            <div className="opponent-container">
              {/* <span className="">Find an opponent</span> */}
              {connecting && <Spinner />}
              <button onClick={handlePlayerPickerClick}>
                {connecting ? "Cancel" : "Find an opponent"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="control-panel">
        <button onClick={resetBoard}>Reset</button>
        <button
          disabled={!isBoardReady || gameStarted}
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
  );
}

export default App;
