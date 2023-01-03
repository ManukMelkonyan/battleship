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

const getBoardCells = (boardConfig) => {
  const board = new Array(BOARD_SIZE)
    .fill()
    .map(() =>
      new Array(BOARD_SIZE)
        .fill()
        .map(() => ({ revealed: false, isShip: false }))
    );

  for (const [key, value] of Object.entries(boardConfig)) {
    const [row, col] = key.split(":").map((e) => Number(e));
    const { size, orientation } = value;
    if (orientation === ORIENTATION.HORIZONTAL) {
      for (let j = 0; j < size; ++j) {
        board[row][col + j].isShip = true;
      }
    } else if (orientation === ORIENTATION.VERTICAL) {
      for (let i = 0; i < size; ++i) {
        board[row + i][col].isShip = true;
      }
    }
  }
  return board;
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
  const [isEditing, setIsEdiding] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isCurrentPlayerWinner, setIsCurrentPlayerWinner] = useState(false);
  const [isCurrentTurn, setIsCurrentTurn] = useState(false);
  // getBoardCells(boardConfig);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [opponentBoard, setOpponentBoard] = useState(getBoardCells({}));

  useEffect(() => {
    if (!isEditing) {
      setCurrentBoard(getBoardCells(boardConfig));
    }
  }, [isEditing, boardConfig]);

  // useEffect(() => {
  //   if (gameStarted) {
  //     console.log("started");
  //     setOpponentBoard(getBoardCells({}));
  //   }
  // }, [gameStarted]);

  const sendMessage = (message) => {
    const stringifiedMessage =
      typeof message === "object"
        ? JSON.stringify(message)
        : message.toString();
    webSocket.send(stringifiedMessage);
  };

  const updateBoard = (revealedCells, isCurrentBoard) => {
    console.log(currentBoard, opponentBoard);
    const board = isCurrentBoard ? currentBoard : opponentBoard;
    const setBoard = isCurrentBoard ? setCurrentBoard : setOpponentBoard;
    revealedCells.forEach(({ row, col, isShip }) => {
      board[row][col].revealed = true;
      board[row][col].isShip = isShip;
    });

    setBoard([...board]);
  };

  const handleReveal = (body) => {
    const { revealedCells, isCurrentPlayerTurn, isCurrentBoard } = body;
    console.log(body);
    updateBoard(revealedCells, isCurrentBoard);
    setIsCurrentTurn(isCurrentPlayerTurn);
  };

  const handleGameStart = (body) => {
    const { isCurrentPlayerTurn } = body;
    setGameStarted(true);
    setIsCurrentTurn(isCurrentPlayerTurn);
  };

  const handleGameOver = (body) => {
    const { isWinner } = body;
    setIsCurrentPlayerWinner(isWinner);
    setGameOver(true);
  };

  const handleGameAbort = (body) => {};

  const handleMessage = (message) => {
    // try {
    console.log(message);
    const messageObj = JSON.parse(message);
    const { messageType, body } = messageObj;
    if (messageType === "reveal") {
      handleReveal(body);
    } else if (messageType === "gameStart") {
      handleGameStart(body);
    } else if (messageType === "gameOver") {
      handleGameOver(body);
    } else if (messageType === "gameAbort") {
      handleGameAbort(body);
    }
    // } catch (err) {
    //   alert(err.message);
    // }
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

  const isBoardReady = useMemo(() => {
    console.log(boardConfig);
    console.log(
      Object.keys(boardConfig).every((key) => !key.startsWith("unset"))
    );
    return Object.keys(boardConfig).every((key) => !key.startsWith("unset"));
  }, [boardConfig]);

  const resetBoard = () => {
    setBoartConfig({ ...defaultConfig });
    setIsEdiding(true);
  };

  const opponentBoardClick = (id) => {
    if (isCurrentTurn && !gameOver) {
      const [row, col] = id.split(":").map((e) => Number(e));
      console.log(row, col);
      const cell = opponentBoard[row][col];
      if (!cell.revealed) {
        setIsCurrentTurn(false);
        sendMessage({
          messageType: "move",
          body: { row, col },
        });
      }
    }
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
        {isEditing ? (
          <BoardEditor
            size={[BOARD_SIZE, BOARD_SIZE]}
            boardConfig={boardConfig}
            setBoardConfig={setBoartConfig}
            isEditing={isEditing}
          />
        ) : (
          <Board
            disabled={isCurrentTurn}
            board={currentBoard}
            footerText="Your board"
          />
        )}
        {isBoardReady && !isEditing && (
          <div className="control-panel">
            {gameStarted ? (
              <Board
                disabled={!isCurrentTurn}
                board={opponentBoard}
                onCellClick={opponentBoardClick}
                footerText="Opponent's board"
              />
            ) : (
              <div className="opponent-container">
                {/* <span className="">Find an opponent</span> */}
                {connecting && <Spinner />}
                <button onClick={handlePlayerPickerClick}>
                  {connecting ? "Cancel" : "Find an opponent"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="control-panel">
        <button onClick={resetBoard}>Reset</button>
        <button
          disabled={!isBoardReady || gameStarted}
          onClick={() => {
            setIsEdiding((editing) => !editing);
          }}
        >
          {isEditing ? "Ready" : "Not ready"}
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
