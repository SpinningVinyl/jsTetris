class Tetromino {
    rotation = 0;
    type = 0;
    x = 4;
    y = 0;
    tmino = ["0100010001000100",   // I-tetromino
        "0100011000100000",   // S-tetromino
        "0000011001100000",   // O-tetromino
        "0110010001000000",   // J-tetromino
        "0010011001000000",   // Z-tetromino
        "0110001000100000",   // L-tetromino
        "0100111000000000"]; // T-tetromino
    color = ["cyan", "green", "yellow", "blue", "red", "orange", "magenta"];

    constructor(type) {
        if (type < 0 || type > 6) {
            throw new Error("Wrong tetromino type.");
        }
        this.type = type;
    }

    atPos = (px, py, r = this.rotation) => {
        const { tmino, color, type } = this;

        let n;
        switch (r % 4) {
            case 1:
                n = 12 - 4 * px + py;
                break;
            case 2:
                n = 15 - px - 4 * py;
                break;
            case 3:
                n = 3 + 4 * px - py;
                break;
            default:
                n = px + 4 * py;
        }
        if (tmino[type].charAt(n) === '1') {
            return color[type];
        }
        return 0;
    }

    getX = () => {
        return this.x;
    }

    getY = () => {
        return this.y;
    }

    getType = () => {
        return this.type;
    }

    getRotation = () => {
        return this.rotation;
    }

    advance = () => {
        this.y += 1;
    }

    moveLeft = () => {
        this.x -= 1;
    }

    moveRight = () => {
        this.x += 1;
    }

    rotate = () => {
        this.rotation += 1;
    }
}

class Tetris {

    rows = 26;
    columns = 12;
    squareSize = 20;

    boardDisplay;
    nextPieceDisplay;
    levelLabel;
    scoreLabel;
    gameOverLabel;
    newGameButton;

    currentPiece;
    nextPiece;

    landed;

    level = 1;
    score = 0;
    inGame = false;

    timer;


    constructor(boardDisplayParent, nextPieceDisplayParent, levelLabel, scoreLabel, gameOverLabel, newGameButton) {
        const { rows, columns, squareSize } = this;
        this.boardDisplay = new SquareGrid(rows - 4, columns, squareSize, boardDisplayParent);
        this.boardDisplay.setDefaultColor('#000000');
        this.boardDisplay.setGridColor(false);
        this.boardDisplay.setAutoRedraw(false);
        this.nextPieceDisplay = new SquareGrid(4, 4, squareSize, nextPieceDisplayParent);
        this.nextPieceDisplay.setDefaultColor('#000000');
        this.nextPieceDisplay.setGridColor(false);
        
        
        this.levelLabel = levelLabel;
        this.scoreLabel = scoreLabel;
        this.gameOverLabel = gameOverLabel;
        this.newGameButton = newGameButton;

        document.body.addEventListener('keydown', (e) => {
            if (this.inGame) {
                this.keyPressed(e);
            }
        });

        this.newGameButton.addEventListener('click', () => {
            this.start();
        });
    }

    clearLanded = () => {
        const { rows, columns } = this;
        // initialize the array of landed pieces
        this.landed = new Array(rows);
        for (let row = 0; row < rows; row++) {
            this.landed[row] = new Array(columns).fill(0);
        }

    }

    keyPressed = (e) => {
        const { currentPiece, collision, boardDisplay } = this;
        let nextX = currentPiece.getX();
        let nextY = currentPiece.getY();
        let nextRotation = currentPiece.getRotation();
        if (e.key === "ArrowUp") {
            nextRotation += 1;
            if (!collision(nextX, nextY, nextRotation)) currentPiece.rotate();
        } else if (e.key === "ArrowLeft") {
            nextX -= 1;
            if (!collision(nextX, nextY)) {
                currentPiece.moveLeft();
            }
        } else if (e.key === "ArrowRight") {
            nextX += 1;
            if (!collision(nextX, nextY)) {
                currentPiece.moveRight();
            }
        } else if (e.key === "ArrowDown") {
            nextY += 1;
            if (!collision(nextX, nextY)) {
                currentPiece.advance();
            }
        }
        boardDisplay.clearGrid();
        this.drawLanded();
        this.drawPiece();
        boardDisplay.redraw();
    }

    start = () => {
        this.score = 0;
        this.level = 1;
        this.inGame = true;
        this.clearLanded();
        this.gameOverLabel.innerText = "";
        this.updateLabels();
        this.currentPiece = new Tetromino(this.getRandomType());
        this.nextPiece = new Tetromino(this.getRandomType());
        this.showNextPiece();
        this.attachTimer(500);
    }

    tick = () => {
        const { currentPiece, boardDisplay, landed, rows, columns } = this;
        boardDisplay.clearGrid();
        this.clearFilledLines();
        this.drawLanded();
        this.drawPiece();

        let nextY = currentPiece.getY() + 1;

        // if the piece can't advance, add it to the landed pile
        if (this.collision(currentPiece.getX(), nextY)) {
            for (let px = 0; px < 4; px++) {
                for (let py = 0; py < 4; py++) {
                    let row = currentPiece.getY() + py;
                    let column = currentPiece.getX() + px;
                    const color = currentPiece.atPos(px, py);
                    if (row < rows && column < columns && color) {
                        landed[row][column] = color;
                    }
                }
            }
            // if the landed piece is at the top edge or higher, game over
            if (currentPiece.getY() <= 4) {
                this.gameOver();
                boardDisplay.redraw();
                return;
            } else {
                this.currentPiece = this.nextPiece;
                this.nextPiece = new Tetromino(this.getRandomType());
                this.showNextPiece();
            }
        }

        //move the current piece one row down
        currentPiece.advance();
        boardDisplay.redraw();
    }

    getRandomType = () => {
        return Math.floor(Math.random() * 7);
    }

    collision = (x, y, r = this.currentPiece.rotation) => {
        const { currentPiece, rows, columns, landed } = this;
        for (let px = 0; px < 4; px++) {
            for (let py = 0; py < 4; py++) {
                let row = y + py;
                let column = x + px;
                if (currentPiece.atPos(px, py, r)) {
                    if (row > rows - 1 || column < 0 || column > (columns - 1)) {
                        return true;
                    } else if (landed[row][column]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    drawPiece = () => {
        const { currentPiece, boardDisplay } = this;
        let startRow = currentPiece.getY() - 4;
        let startColumn = currentPiece.getX();
        for (let px = 0; px < 4; px++) {
            for (let py = 0; py < 4; py++) {
                let row = startRow + py;
                let column = startColumn + px;
                let color = currentPiece.atPos(px, py);
                if (row >= 0 && row < boardDisplay.getRows() && column >= 0 && column < boardDisplay.getColumns() && color) {
                    boardDisplay.setCellColor(row, column, color);
                }
            }
        }
    }

    showNextPiece = () => {
        const { nextPieceDisplay, nextPiece } = this;
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                nextPieceDisplay.setCellColor(y, x, nextPiece.atPos(x, y));
            }
        }
    }

    drawLanded = () => {
        const { rows, columns, boardDisplay, landed } = this;
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                if (row >= 4) {
                    boardDisplay.setCellColor(row - 4, column, landed[row][column]);
                }
            }
        }
    }

    clearFilledLines = () => {
        const { landed, rows, columns } = this;
        let clearedLines = 0;

        for (let row = rows - 1; row >= 0; row--) {
            let isFilled = true;
            for (let column = 0; column < columns; column++) {
                if(!landed[row][column]) {
                    isFilled = false;
                    break;
                }
            }
            if(isFilled) {
                this.clearRow(row);
                row += 1;
                clearedLines += 1;
            }
        }


        switch(clearedLines) {
        case 1:
            this.score += 100;
            break;
        case 2:
            this.score += 300;
            break;
        case 3:
            this.score += 500;
            break;
        case 4:
            this.score += 800;
        }

        this.updateScore();
        
    }

    updateScore = () => {
        const { score } = this;
        if (score >= 12000) {
            this.level = 7;
            this.attachTimer(100);
        } else if (score >= 9000) {
            this.level = 6;
            this.attachTimer(150);
        } else if (score >= 6000) {
            this.level = 5;
            this.attachTimer(200);
        } else if (score >= 4500) {
            this.level = 4;
            this.attachTimer(250);
        } else if (score >= 3000) {
            this.level = 3;
            this.attachTimer(350);
        } else if (score >= 1500) {
            this.level = 2;
            this.attachTimer(400);
        }
        this.updateLabels();
    }

    attachTimer = (millis) => {
        this.clearTimer();
        this.timer = setInterval(this.tick, millis);
    }

    clearTimer = () => {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateLabels = () => {
        const { levelLabel, scoreLabel } = this;
        levelLabel.innerText = "Level: " + this.level;
        scoreLabel.innerText = "Score: " + this.score;
    }

    gameOver = () => {
        const { gameOverLabel } = this;
        clearInterval(this.timer);
        gameOverLabel.innerText = "GAME OVER";
        this.inGame = false;
        
    }

    clearRow(row) {
        const { columns, landed } = this;
        for (let r = row; r > 0; r--) {
            for (let c = 0; c < columns; c++) {
                landed[r][c] = landed[r-1][c];
            }
        }
    }

}
