import React, { useEffect, useMemo, useState } from "react";

import Board from "./Board";
import BoardEditor from "./BoardEditor";
import Modal from "react-modal";

import { BOARD_SIZE, serverUrl, sizeCountMap } from "./constants";
import texts from "./texts.json";

import { ReactComponent as Spinner } from "./Assets/spinner.svg";
import { constructConfigFromCells, generateBoard, getBoardCells, getInitialBoardConfig } from "./BoardHelpers";


function App() {
  const defaultConfig = useMemo(
    () => getInitialBoardConfig(sizeCountMap),
    []
  );
  const [boardConfig, setBoartConfig] = useState(defaultConfig);
  const [isEditing, setIsEdiding] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isCurrentTurn, setIsCurrentTurn] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [opponentBoard, setOpponentBoard] = useState(getBoardCells({}));
  const [modalText, setModalText] = useState(null);

  const sendMessage = (message) => {
    const stringifiedMessage =
      typeof message === "object"
        ? JSON.stringify(message)
        : message.toString();
    webSocket.send(stringifiedMessage);
  };

  const updateBoard = (revealedCells, isCurrentBoard) => {
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
    updateBoard(revealedCells, isCurrentBoard);
    setIsCurrentTurn(isCurrentPlayerTurn);
  };

  const handleGameStart = (body) => {
    const { isCurrentPlayerTurn } = body;
    setGameStarted(true);
    setGameOver(false);
    setIsCurrentTurn(isCurrentPlayerTurn);
  };

  const handleGameOver = (body) => {
    const { isWinner } = body;
    setModalText(isWinner ? texts.winner_text : texts.loser_text);
    setGameOver(true);
    setGameStarted(false);
  };

  const handleMessage = (message) => {
    const messageObj = JSON.parse(message);
    const { messageType, body } = messageObj;
    if (messageType === "reveal") {
      handleReveal(body);
    } else if (messageType === "gameStart") {
      handleGameStart(body);
    } else if (messageType === "gameOver") {
      handleGameOver(body);
    }
  };

  const connectToServer = () => {
    setConnecting(true);
    const ws = new WebSocket(serverUrl);
    setWebSocket(ws);
  };

  const abortConnection = () => {
    if (webSocket) {
      webSocket.close(1000);
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
    return Object.keys(boardConfig).every((key) => !key.startsWith("unset"));
  }, [boardConfig]);

  const resetBoard = () => {
    setIsEdiding(true);
    setBoartConfig({ ...defaultConfig });
    setCurrentBoard(getBoardCells({}));
    setOpponentBoard(getBoardCells({}));
  };

  const opponentBoardClick = (id) => {
    if (isCurrentTurn && !gameOver) {
      const [row, col] = id.split(":").map((e) => Number(e));
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

  const handleModalClose = () => {
    setModalText(null);
    setGameStarted(false);
    resetBoard();
  };

  useEffect(() => {
    if (!isEditing) {
      setCurrentBoard(getBoardCells(boardConfig));
    }
  }, [isEditing, boardConfig]);

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
      if (gameStarted) {
        setGameStarted(false);
        if (modalText) setModalText(texts.connection_lost_text);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardConfig, gameStarted, webSocket]);

  return (
    <div>
      <h2 className="game-title">⚓ Battleship game ⚓</h2>
      <div className="main-layout">
        {isEditing ? (
          <BoardEditor
            size={[BOARD_SIZE, BOARD_SIZE]}
            boardConfig={boardConfig}
            setBoardConfig={setBoartConfig}
            isEditing={isEditing}
          />
        ) : (
          <Board
            disabled={isCurrentTurn || gameOver}
            board={currentBoard}
            footerText="Your board"
          />
        )}
        {isBoardReady && !isEditing && (
          <div className="control-panel">
            {gameStarted ? (
              <Board
                disabled={!isCurrentTurn || gameOver}
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
        <button disabled={gameStarted || connecting} onClick={resetBoard}>
          Reset
        </button>
        <button
          disabled={!isBoardReady || gameStarted || connecting}
          onClick={() => {
            setIsEdiding((editing) => !editing);
          }}
        >
          {isEditing ? "Ready" : "Not ready"}
        </button>
        <button
          disabled={gameStarted || connecting}
          onClick={() =>
            setBoartConfig(constructConfigFromCells(generateBoard()))
          }
        >
          Randomize
        </button>
      </div>
      <Modal ariaHideApp={false} isOpen={!!modalText} className="modal">
        <div className="control-panel modal-content">
          <span>{modalText}</span>
          <button onClick={handleModalClose}>OK</button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
