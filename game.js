class Minesweeper {
    
    /**
     * 
     * @param {*} rows 
     * @param {*} cols 
     * @param {*} mines 
     */
    constructor(rows, cols, numMines) {
        this.rows = rows;
        this.cols = cols;
        this.numMines = numMines;

        // Grid
        this.grid = new Grid(rows, cols);
        
        // Generate mines
        this.minesArr = this.getRandomMines(rows, cols, numMines);
        
        // Create GUI
        this.tiles = new Tiles(rows, cols, this.grid);
    }

    getRandomMines(rows, cols, numMines) {
        let minesArr = [];
        for (let i = 0; i < numMines; i++) {
            let mine = new Mine(rows, cols);
            while (this.grid.containsMine(mine.row, mine.col)) {
                mine.refreshPosition(rows, cols);
            }
            this.grid.putMine(mine);
            minesArr.push(mine);
        }
        return minesArr;
    }
}

class Mine {
    constructor(rows, cols) {
        this.row = Math.floor(Math.random() * rows);
        this.col = Math.floor(Math.random() * cols);
    }
    
    refreshPosition(rows, cols) {
        this.row = Math.floor(Math.random() * rows);
        this.col = Math.floor(Math.random() * cols);
    }
}

class Grid {
    constructor(rows, cols) {
        this.arr = [];
        this.rows = rows;
        this.cols = cols; 

        for (let i = 0; i < rows; i++) {
            let rowArr = [];
            for (let j = 0; j < cols; j++) {
                rowArr.push(0);
            }
            this.arr.push(rowArr);
        }
    }

    putMine(mine) {
        let row = mine.row, col = mine.col;

        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw Error(`Grid coordinate (${row}, ${col}) out of bounds`)
        }
        else if (typeof(this.arr[row][col]) === '[object Mine]') {
            throw Error(`Mine already exists at (${row}, ${col})`);
        }

        // Place mine
        this.arr[row][col] = mine;
        // Update adjacent tiles
        if (col > 0) this.incrementLocation(row, col - 1);
        if (col < this.cols - 1) this.incrementLocation(row, col + 1);
        if (row > 0) {
            this.incrementLocation(row - 1, col);
            if (col > 0) this.incrementLocation(row - 1, col - 1);
            if (col < this.cols - 1) this.incrementLocation(row - 1, col + 1);
        }
        if (row < this.rows - 1) {
            this.incrementLocation(row + 1, col);
            if (col > 0) this.incrementLocation(row + 1, col - 1);
            if (col < this.cols - 1) this.incrementLocation(row + 1, col + 1);
        }
    }

    incrementLocation(row, col) {
        if (!this.containsMine(row, col)) this.arr[row][col] += 1;
    }

    getValue(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw Error(`Grid coordinate (${row}, ${col}) out of bounds`)
        }
        return this.arr[row][col];
    }

    containsMine(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw Error(`Grid coordinate (${row}, ${col}) out of bounds`)
        }
        return (this.getValue(row, col) instanceof Mine);
    }
}

class Tiles {
    constructor(rows, cols, grid) {
        this.rows = rows;
        this.cols = cols;
        this.grid = grid;
        
        [this.tiles, this.hidden] = this.initializeTiles(rows, cols, grid);

        console.log(this.tiles);
    }

    initializeTiles(rows, cols) {
        let tiles = [], hidden = [];
        
        for (let i = 0; i < rows; i++) {
            tiles[i] = [];
            hidden[i] = [];
            for (let j = 0; j < cols; j++) {

                let div = document.createElement("div");
                div.className = "tile";
                div.style.left = new String(i * 60) + "px";
                div.style.top = new String(j * 60) + "px";
                div.row = i;
                div.col = j;
                div.style.backgroundColor = "gray";
                div.onclick = (() => {this.reveal(div.row, div.col);});
                div.oncontextmenu = (() => {this.flag(div.row, div.col); return false;});
                
                tiles[i][j] = div;
                document.body.appendChild(div);

                hidden[i][j] = true;
            }
        }
        
        return [tiles, hidden];
    }

    reveal(row, col) {
        let div = this.tiles[row][col];
        let value = this.grid.getValue(row, col);
        this.hidden[row][col] = false;

        div.style.removeProperty('background-color');

        if (value === 0) {
            // Update adjacent tiles
            if (this.hidden[row]) {
                if (this.hidden[row][col - 1]) this.reveal(row, col - 1);
                if (this.hidden[row][col + 1]) this.reveal(row, col + 1);
            }
            if (this.hidden[row - 1]) {
                if (this.hidden[row - 1][col]) this.reveal(row - 1, col);
                if (this.hidden[row - 1][col - 1]) this.reveal(row - 1, col - 1);
                if (this.hidden[row - 1][col + 1]) this.reveal(row - 1, col + 1);
            }
            if (this.hidden[row + 1]) {
                if (this.hidden[row + 1][col]) this.reveal(row + 1, col);
                if (this.hidden[row + 1][col - 1]) this.reveal(row + 1, col - 1);
                if (this.hidden[row + 1][col + 1]) this.reveal(row + 1, col + 1);
            }
        } else {
            if (value instanceof Mine) {
                div.style.backgroundColor = "black";
                window.alert("owned");
            } else {
                div.innerHTML = value;
            }
        }
    }

    flag(row, col) {
        let div = this.tiles[row][col];
        console.log(div.style.backgroundColor);
        if (div.style.backgroundColor != "red") {
            div.style.backgroundColor = "red";
        }
        else {
            div.style.backgroundColor = "gray";
        }
    }
}