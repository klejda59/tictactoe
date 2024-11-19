const GameBoard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];
    let moveCount = 0;

    const getBoard = () => board;

    const updateBoard = (index, symbol) => {
        if (board[index] === "")  {
            board[index] = symbol;
            moveCount++;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        board.fill(""); 
        moveCount = 0;
    };


    // checks that a given set of indices 
    // on the board all match a given symbol
    function checkLine(symbolIn, checkerArr) {
        const temp = [];
        checkerArr.forEach((index) => {
            temp.push(board[index]);
        });
        return temp.every((elem) => elem === symbolIn);
    };

    // returns 1 if winner, 0 if not, -1 if draw
    const checkResult = (index) => {
        const leftDiag = [0, 4, 8];
        const rightDiag = [2, 4, 6];
        const firstCol = [0, 3, 6];
        const secondCol = [1, 4, 7];
        const thirdCol = [2, 5, 8];
        const playerSymbol = board[index];

        // check diags
        if(index % 2 === 0) {
            if (checkLine(playerSymbol, leftDiag)) {
                return 1;
            }
            if (checkLine(playerSymbol, rightDiag)) {
                return 1;
            }
        }

        switch (index % 3) {
            case 0:
                if (checkLine(playerSymbol, firstCol)) {
                    return 1;
                }
                if (board[index + 1] === playerSymbol && board[index + 2] === playerSymbol) {
                    return 1;
                }
                break;
            case 1:
                if (checkLine(playerSymbol, secondCol)) {
                    return 1;
                }
                if (board[index + 1] === playerSymbol && board[index - 1] === playerSymbol) {
                    return 1;
                }
                break;
            case 2:
                if (checkLine(playerSymbol, thirdCol)) {
                    return 1;
                }
                if (board[index - 1] === playerSymbol && board[index - 2] === playerSymbol) {
                    return 1;
                }
                break;
        }

        if(moveCount >= 9) {
            return -1;
        }
        return 0;
    };
    return {getBoard, updateBoard, resetBoard, checkResult};
})(); 

const Player = (nameIn, symbolIn) => {
    let name = nameIn;
    let symbol = symbolIn;
    
    const setPlayerName = (nameIn) => name = nameIn;
    const getPlayerName = () => name;
    const setPlayerSymbol = (symbolIn) => symbol = symbolIn;
    const getPlayerSymbol = () => symbol;

    return {getPlayerName, setPlayerName, getPlayerSymbol, setPlayerSymbol,};

};

const GameController = (() => {
    const playerOne = Player('Player 1', 'x');
    const playerTwo = Player('Player 2', 'o');
    let isPlayerOneTurn = true; // flips after every player turn
    let isGameOver = false;
    let round = 0; 

    // this ensures each player gets a chance to be the first to play a move
    // since first move is a big advantage.
    function setFirstPlayer() {
        if (round % 2 === 0) {
            isPlayerOneTurn = true;
        } else {
            isPlayerOneTurn = false;
        }
    }

    // tracking score over several rounds
    let playerOneScore = 0;
    let playerTwoScore = 0;
    let draws = 0;

    const getCurrentPlayer = () => {
        if (isPlayerOneTurn) {
            return playerOne;
        } else {
            return playerTwo;
        }
    };

    const setPlayerNames = (playerOneName, playerTwoName) => {
        playerOne.setPlayerName(playerOneName);
        playerTwo.setPlayerName(playerTwoName);
    };

    // input 0 for player 1, and 1 for player 2
    const getPlayerName = (player) => {
        if (player === 0) {
            return playerOne.getPlayerName();
        } else if (player === 1) {
            return playerTwo.getPlayerName();
        }
    }

    // returning empty str means no move was played
    const playMove = (index) => {
        if (isGameOver) {
            return;
        }

        let output = "";
        const currentPlayer = getCurrentPlayer();
        const move = GameBoard.updateBoard(index, currentPlayer.getPlayerSymbol());

        if(move) {
            const result = GameBoard.checkResult(index);
            switch (result) {
                case 1:
                    if(isPlayerOneTurn) {
                        playerOneScore++;
                    } else {
                        playerTwoScore++;
                    }
                    isGameOver = true;
                    output = `${currentPlayer.getPlayerName()} wins this round!`;
                    break;
                case 0:
                    isPlayerOneTurn = !isPlayerOneTurn;
                    break;
                case -1:
                    isGameOver = true;
                    draws++;
                    output = "it's a draw!";
                    break;
                default:
                    break;
            }
        }
        return output;
    };

    const resetGame = () => {
        GameBoard.resetBoard();
        isPlayerOneTurn = true;
        playerOneScore = 0;
        playerTwoScore = 0;
        draws = 0;
        isGameOver = false;
        setPlayerNames('Player 1', 'Player 2');
        round = 0;
    };

    const nextRound = () => {
        GameBoard.resetBoard();
        round++;
        setFirstPlayer();
        isGameOver = false;

    }

    const getScores = () =>  ({
        playerOneScore,
        playerTwoScore,
        draws,
    });

    return {getCurrentPlayer, setPlayerNames, playMove, resetGame, getScores, nextRound, getPlayerName};
})();


const DisplayController = (() => {
    const gameBoard = document.getElementById("gameboard");
    const anotherRoundBtn = document.getElementById("btn-another-round");
    const startBtn = document.getElementById("btn-start");
    const plOneInput = document.getElementById("in-player-one");
    const plTwoInput = document.getElementById("in-player-two");
    const gameStatus = document.getElementById("game-status");
    const plOneScore = document.getElementById("score-player-one");
    const plTwoScore = document.getElementById("score-player-two");
    const drawScore = document.getElementById("score-draws");
    const resetBtn = document.getElementById("btn-reset-game");
    const currentPlayer = document.getElementById("current-player");
    
    const renderBoard = () => {
        gameBoard.innerHTML = ""; 
        const board = GameBoard.getBoard();
        board.forEach((symbol, index) => {
            const cell = document.createElement("div");
            cell.textContent = symbol;
            // TODO: move listener to gameBoard element later
            cell.addEventListener("click", () => cellClickHandler(index)); 
            gameBoard.appendChild(cell);
        });
    };


    const updateScores = () => {
        const scores = GameController.getScores();
        plOneScore.textContent = `${GameController.getPlayerName(0)} wins: ${scores.playerOneScore}`;
        plTwoScore.textContent = `${GameController.getPlayerName(1)} wins: ${scores.playerTwoScore}`;
        drawScore.textContent = `Draws: ${scores.draws}`;
    };

    // cell click handler
    const cellClickHandler = (index) => {
        const result = GameController.playMove(index);
        currentPlayer.textContent = `Current player: ${GameController.getCurrentPlayer().getPlayerName()}`;
        if (result) {
            gameStatus.textContent = result;
            gameStatus.classList.remove("hidden");
            anotherRoundBtn.classList.remove("hidden");
            updateScores();
        }
        renderBoard();
    };


    const startGame = () => {
        GameController.setPlayerNames((plOneInput.value || 'Player 1'), (plTwoInput.value || 'Player 2'));
        gameStatus.classList.add("hidden");
        anotherRoundBtn.classList.add("hidden");
        renderBoard();
        updateScores();
        currentPlayer.textContent = `current player is: ${GameController.getCurrentPlayer().getPlayerName()}`;
    };

    startBtn.addEventListener("click", startGame);

    anotherRoundBtn.addEventListener("click", () => {
        GameController.nextRound();
        renderBoard(); 
        gameStatus.classList.add("hidden");
        anotherRoundBtn.classList.add("hidden");
    });

    resetBtn.addEventListener("click", () => {
        GameController.resetGame();
        updateScores();
        renderBoard();
        gameStatus.classList.add("hidden");
        anotherRoundBtn.classList.add("hidden");
    });
    
    renderBoard();
    // return { renderBoard };
})();