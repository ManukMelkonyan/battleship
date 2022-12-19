import React from "react";
import Battlefield from "./Battlefield";

function App() {
  return (
    <div>
      <h2
        style={{
          margin: "auto",
          width: "30%",
          textAlign: "center",
        }}
      >
        Battleship game
      </h2>
      <div
        style={{
          margin: "auto",
          width: "30%",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <Battlefield size={[10, 10]} />
        <Battlefield size={[10, 10]} />
      </div>
    </div>
  );
}

export default App;
