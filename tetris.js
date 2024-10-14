class Tetromino {
    rotation = 0;
    type;
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
            default:
                n = px + 4 * py;
        }
        if (tmino[type][n] === '1') {
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

    rows = 22;
    columns = 12;
    squareSize = 20;

    boardDisplay;
    nextPieceDisplay;
    levelLabel;
    scoreLabel;

    currentPiece = new Tetromino(this.getRandomType());
    nextPiece = new Tetromino(this.getRandomType());

    landed;

    level = 1;
    score = 0;

    timer;


    constructor(boardDisplayParent, nextPieceDisplayParent, levelLabel, scoreLabel) {
        const { rows, columns, squareSize } = this;
        this.boardDisplay = new SquareGrid(rows - 4, columns, squareSize, boardDisplayParent);
        this.nextPieceDisplay = new SquareGrid(4, 4, squareSize, nextPieceDisplayParent);
        this.levelLabel = levelLabel;
        this.scoreLabel = scoreLabel;
        // initialize the array of landed pieces
        this.landed = new Array(rows).fill(new Array(columns).fill(0));
    }

    tick = () => {
        const { currentPiece, boardDisplay } = this;
        this.clearFilledLines();
        this.drawLanded();
        this.drawPiece();

        nextY = currentPiece.getY() + 1;

        // if the piece can't advance, add it to the landed pile
        if (this.collision(currentPiece.getX(), nextY)) {
            for (let px = 0; px < 4; px++) {
                for (let py = 0; py < 4; py++) {
                    const row = currentPiece.getY() + py;
                    const column = currentPiece.getX() + px;
                    landed[row][column] = currentPiece.atPos[px][py];
                }
            }
            // if the landed piece is at the top edge or higher, game over
            if (currentPiece.getY() <= 4) {
                this.gameOver();
            } else {
                this.currentPiece = new Tetromino(this.getRandomType());
                this.nextPiece = new Tetromino(this.getRandomType());
                this.showNextPiece();
            }
        }

        //move the current piece one row down
        currentPiece.advance();
        boardDisplay.redraw();
    }

    getRandomType = () => {
        return Math.floor(Math.random * 8);
    }

    collision = (x, y, r = this.currentPiece.getRotation()) => {
        const { currentPiece } = this;
        for (let px = 0; px < 4; px++) {
            for (let py = 0; py < 4; py++) {
                let row = y + py;
                let column = x + px;
                if (currentPiece.atPos(px, py, r)) {
                    if (row > rows - 1 || columns < 0 || column > (columns - 1)) {
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
                row = startRow + py;
                column = startColumn + px;
                color = currentPiece.atPos(px, py);
                if (row >= 0 && row < boardDisplay.getRows() && column >= 0 && column < boardDisplay.getColumns()) {
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
                boardDisplay.setCellColor(row - 4, column, landed[row][column]);
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
                clearRow(row);
                row += 1;
                clearedLines += 1;
            }
        }

        switch(clearedLines) {
        case 1:
            score += 100;
            break;
        case 2:
            score += 300;
            break;
        case 3:
            score += 500;
            break;
        case 4:
            score += 800;
        }

        this.updateScore();
        
    }

    updateScore = () => {
        if (score >= 9000) {
            this.level = 6;
            clearInterval(this.timer);
            this.timer = setInterval(this.tick, 1000);
        } else if (score >= 6000) {
            this.level = 5;
            clearInterval(this.timer);
            this.timer = setInterval(this.tick, 1500);
        } else if (score >= 4500) {
            this.level = 4;
            clearInterval(this.timer);
            this.timer = setInterval(this.tick, 2000);
        } else if (score >= 3000) {
            this.level = 3;
            clearInterval(this.timer);
            this.timer = setInterval(this.tick, 3000);
        } else if (score >= 1500) {
            this.level = 2;
            clearInterval(this.timer);
            this.timer = setInterval(this.tick, 4000);
        }
    }

}
