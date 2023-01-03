# Battleship
Classical battleship game with live connection, using websocket protocol and custom implemented [websocket library](https://github.com/ManukMelkonyan/socketter).

## Setup
* Client
 ```bash
 cd ./client && npm start
 ```
* Server
 ```bash
 cd ./server && npm start
 ```


## Game control

* Click a ship once to select it, than move the cursor on the board and place it wherever it's allowed.
* When a ship is selected, press `R` to rotate the ship.
* Click `Randomize` button to place all ships randomly accross the board
* To consume a shot, simply click on the unrevealed cell on the board of your opponent, when it's your turn.
* The apponent's board will be highlighted when it's your turn.