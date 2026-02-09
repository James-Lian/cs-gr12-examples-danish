// recursion function is here! line 182

/**
 * @name GameManager
 *
 * @class
 *
 * @description Creates (and renders) the entire maze in which the game
 * will be played through. Incorperates size, position, word sizes, and the cell size
 *
 * @public {p5.Vector} mazeSize - size of the maze.
 * @public {p5.Vector} currentPosition - position of the maze simulates movement 
 * @private {Array} letters - the letters that will be scattered throughout the maze
 * @private {Number} cellSize - size of each of the maze cells
 * @public {Number} score - the score of the player
 * @public {Number} maxScore - the maximum score that the player can reach before the game ends
 * @public {Boolean} gameFinished - boolean that states whether the game is over or not
 */
class GameManager {
	constructor({sizeX, sizeY, x=width/2, y=height/2, letters, cellSize, score=0, maxScore}) {
		this.size = createVector(sizeX, sizeY);
		this.pos = createVector(x, y);
		this.playerPos = createVector(0, 0);
		this.letters = letters;
		// contains positions of letters and also walls
		this.letterPositions = Array.from({ length: sizeY }, 
			() => Array.from({ length: sizeX }, () => ({
				letter: "",
				n: true,
				s: true,
				w: true,
				e: true
			  })));
		this.collectedLetters = {
			"a": 0,"b": 0,"c": 0,"d": 0,"e": 0,"f": 0,"g": 0,"h": 0,"i": 0,"j": 0,"k": 0,"l": 0,"m": 0,"n": 0,"o": 0,"p": 0,"q": 0,"r": 0,"s": 0,"t": 0,"u": 0,"v": 0,"w": 0,"x": 0,"y": 0,"z": 0,
		}
		this.cellSize = cellSize;
		this.score = score;
		this.maxScore = maxScore;
		this.gameFinished = false;
		this.pathfindingMode = false;
		this.letterToFind = "s";
	}
	
	/** 
		* @method moveMaze
		* @description Simulates player movement, prevents player from moving out of bounds or through walls
	*/
	moveMaze(moveX, moveY) {
		let playerX = this.playerPos.x
		let playerY = this.playerPos.y
		if (moveX > 0) {
			if (!this.letterPositions[this.playerPos.y][this.playerPos.x]["e"]) {
				playerX += moveX;
			}
		} else if (moveX < 0) {
			if (!this.letterPositions[this.playerPos.y][this.playerPos.x]["w"]) {
				playerX += moveX;
			}
		}
		if (moveY > 0) {
			if (!this.letterPositions[this.playerPos.y][this.playerPos.x]["s"]) {
				playerY += moveY;
			}
		} else if (moveY < 0) {
			if (!this.letterPositions[this.playerPos.y][this.playerPos.x]["n"]) {
				playerY += moveY;
			}
		}
		
		playerX = Math.min(Math.max(playerX, 0), this.size.x - 1); // no out of bounds travel
		playerY = Math.min(Math.max(playerY, 0), this.size.y - 1);

		if (this.letterPositions[playerY][playerX]["letter"] !== "") {
			this.collectedLetters[this.letterPositions[playerY][playerX]["letter"]] += 1;
			this.letterPositions[playerY][playerX]["letter"] = "";
		}
		const offsetX = width/2 -playerX * this.cellSize + this.cellSize / 2; // Negative because maze moves opposite to player
		const offsetY = height/2 -playerY * this.cellSize + this.cellSize / 2;
	    
		this.playerPos.set(playerX, playerY)
		
		// Center everything and add offset
		this.pos = createVector(
	       offsetX,  // offset from cellPos
	       offsetY
	   );
	}

	/** 
		* @method generateMaze
		* @description Creates mathematical representation of maze and randomizes letter positions using Prim's Algorithm
	*/
	generateMaze() {
		const allPossiblePositions = [];
		for (let yPos=0; yPos < this.letterPositions.length; yPos++) {
			for (let xPos=0; xPos < this.letterPositions[yPos].length; xPos++) {
				allPossiblePositions.push([xPos, yPos]);
			}
		}

		// generating the actual maze with Prim's algorithm
		let visited = [random(allPossiblePositions)];
		const getFrontierCells = (pos) => {
			let frontier = []
			if (pos[1] < this.size.y - 1) {
				// checking if the neighbour cell is already visited
				if (!visited.some(sub => sub[0] === pos[0] && sub[1] === pos[1] + 1)) {
					if (!frontier.some(sub => sub[0] === pos[0] && sub[1] === pos[1] + 1)) {
						frontier.push([pos[0], pos[1]+1]);
					}
				}
			}
			if (pos[1] > 0) {
				if (!visited.some(sub => sub[0] === pos[0] && sub[1] === pos[1] - 1)) {
					if (!frontier.some(sub => sub[0] === pos[0] && sub[1] === pos[1] - 1)) {
						frontier.push([pos[0], pos[1]-1]);
					}
				}
			}
			if (pos[0] > 0) {
				if (!visited.some(sub => sub[0] === pos[0] - 1 && sub[1] === pos[1])) {
					if (!frontier.some(sub => sub[0] === pos[0] - 1 && sub[1] === pos[1])) {
						frontier.push([pos[0]-1, pos[1]]);
					}
				}
			}
			if (pos[0] < this.size.x - 1) {
				if (!visited.some(sub => sub[0] === pos[0] + 1 && sub[1] === pos[1])) {
					if (!frontier.some(sub => sub[0] === pos[0] + 1 && sub[1] === pos[1])) {
						frontier.push([pos[0]+1, pos[1]]);
					}
				}
			}
			return frontier;
		}
		const getVisitedNeighbours = (pos) => {
			let neighbours = []
			if (pos[1] < this.size.y - 1) {
				// checking if the neighbour cell is already visited
				if (visited.some(sub => sub[0] === pos[0] && sub[1] === pos[1] + 1)) {
					neighbours.push("s");
				}
			}
			if (pos[1] > 0) {
				if (visited.some(sub => sub[0] === pos[0] && sub[1] === pos[1] - 1)) {
					neighbours.push("n");
				}
			}
			if (pos[0] > 0) {
				if (visited.some(sub => sub[0] === pos[0] - 1 && sub[1] === pos[1])) {
					neighbours.push("w");
				}
			}
			if (pos[0] < this.size.x - 1) {
				if (visited.some(sub => sub[0] === pos[0] + 1 && sub[1] === pos[1])) {
					neighbours.push("e");
				}
			}
			return neighbours;
		}
		let frontierCells = getFrontierCells(visited[0]);
		while (frontierCells.length !== 0) {
			let randomI = Math.floor(Math.random() * (frontierCells.length - 1 + 1))
			let newVisited = frontierCells[randomI];
			frontierCells.splice(randomI, 1);
			
			let x = newVisited[0];
			let y = newVisited[1];
			frontierCells.push(...getFrontierCells(newVisited));
			let connectingCell = random(getVisitedNeighbours(newVisited));
			if (connectingCell === "n") {
				this.letterPositions[y][x]["n"] = false;
				this.letterPositions[y-1][x]["s"] = false;
			} else if (connectingCell === "s") {
				this.letterPositions[y][x]["s"] = false;
				this.letterPositions[y+1][x]["n"] = false;
			} else if (connectingCell === "e") {
				this.letterPositions[y][x]["e"] = false;
				this.letterPositions[y][x+1]["w"] = false;
			} else if (connectingCell === "w") {
				this.letterPositions[y][x]["w"] = false;
				this.letterPositions[y][x-1]["e"] = false;
			}
			
			visited.push(newVisited);
		}
		
		for (let letter of this.letters) {
			while (true) {
				// Generating the random letters, using random() method
				let randomPosition = random(allPossiblePositions);
				let x = randomPosition[0]
				let y = randomPosition[1]

				if (this.letterPositions[y][x]["letter"] === "") {
					this.letterPositions[y][x]["letter"] = letter;
					break;
				}
			}
		}
	}

	/** 
		* @method findLetterBFSRecursive
		* @description Recursively finds a specified nearest letter through the maze
      * Worst case scenario, it will run mazeSize^2 times. Best case scenario, it will run 1 time. 
	   * The recursion depth is variable, depends on the layout of the maze and whichever letter is specified. 
	   *
	   * @param [queue] - frontier cells to explore
	   * @param [visited] - visited cells
	   * @param [parent] - maps "x,y" -> "px,py" for path reconstruction
	   * @param [target] - target letter
	*/
	findLetterBFSRecursive(queue, visited, parent, target) {
	  // base case: queue empty
	  if (queue.length === 0) return null;
	
	  // take first cell
	  const [x, y] = queue.shift();
	
	  // check current cell
	  if (this.letterPositions[y][x].letter === target) {
	    // reconstruct path
	    const path = [];
	    let key = `${x},${y}`;
	    while (key) {
	      const [cx, cy] = key.split(",").map(Number);
	      path.push([cx, cy]);
	      key = parent.get(key);
	    }
	    path.reverse();
	    return { pos: [x, y], path };
	  }
	
	  // explore neighbours
	  const dirs = [
	    { dx: 0, dy: -1, wall: "n" },
	    { dx: 0, dy: 1, wall: "s" },
	    { dx: -1, dy: 0, wall: "w" },
	    { dx: 1, dy: 0, wall: "e" }
	  ];
	
	  for (let { dx, dy, wall } of dirs) {
	    const nx = x + dx, ny = y + dy;
	    const nkey = `${nx},${ny}`;
	    if (
	      nx >= 0 && nx < this.size.x &&
	      ny >= 0 && ny < this.size.y &&
	      !visited.has(nkey) &&
	      this.letterPositions[y][x][wall] === false
	    ) {
	      visited.add(nkey);
	      parent.set(nkey, `${x},${y}`);
	      queue.push([nx, ny]);
	    }
	  }
	
	  // recurse with updated queue
	  return this.findLetterBFSRecursive(queue, visited, parent, target);
	}
	
	/** 
		* @method findLetterBFS
		* @description Control method that initializes findLetterBFSRecursive
      * Worst case scenario, it will run 900 times. Best case scenario, it will run 1 time. 
	   * The recursion depth is variable, depends on the layout of the maze and whichever letter is specified. 
	   *
	   * @param [startX] - starting x position
	   * @param [startY] - starting y position
	   * @param [target] - target letter
	*/
	findLetterBFS(startX, startY, target) {
		if (target === "") return null;
		const queue = [[startX, startY]];
		const visited = new Set([`${startX},${startY}`]);
		const parent = new Map();
		return this.findLetterBFSRecursive(queue, visited, parent, target);	}

	/**
		* @method initializeGame
	   * @description Initializes the game, resets score
	*/
	initializeGame() {
		this.score = 0; // resets the score
		this.generateMaze();
		this.gameUpdate();
		this.moveMaze(0, 0);
	}

	/** 
		* @method isFinishedGame
		* @description Returns true if the maxScore is reached, otherwise returns False
   */
	_isFinishedGame() {
		if (this.score == this.maxScore) {
			this.gameFinished = true;
			return true;
		}
		return false;
	}

	/** 
		* @method gameOverScreen
	   * @description Displays a game over screen once the game is over
	*/
	gameOverScreen() {
		
	}

	/** 
		* @method gameUpdate
		* @description Renders the maze every frame and checks the game conditions, the score, etc.
	*/
	gameUpdate() {
		this._isFinishedGame();

		if (this.pathfindingMode) {
			let result;
			if (this.letterToFind) {
				result = gameManager.findLetterBFS(this.playerPos.x, this.playerPos.y, this.letterToFind);
			}
			result["path"].push(result["final"]);
			for (let cell of result["path"]) {
				if (cell) {
					const x = this.pos.x + ((cell[0]) * this.cellSize) - this.cellSize;
					const y = this.pos.y + ((cell[1]) * this.cellSize) - this.cellSize;
					fill(255, 215, 0);
					strokeWeight(0);
					rect(x, y, this.cellSize, this.cellSize); 
				}
			}
		}

		// if the game is finished, interupts further graphics rendering and displays a game over screen
		if (this.gameFinished == true) {
			this.gameOverScreen();
			return;
		}

		// drawing the letters on a grid-based pattern, and the walls of the maze
		for (let yPos=0; yPos < this.letterPositions.length; yPos++) {
			for (let xPos=0; xPos < this.letterPositions[yPos].length; xPos++) {
				fill(0);
				strokeWeight(1);
				textAlign(CENTER, CENTER);
				textSize(this.cellSize * 0.6);

				const x = this.pos.x + ((xPos) * this.cellSize) - this.cellSize/2;
				const y = this.pos.y + ((yPos) * this.cellSize) - this.cellSize/2;
	
				text(this.letterPositions[yPos][xPos]["letter"], x, y);
				
				if (this.letterPositions[yPos][xPos]["n"] === true) {
					line(x - this.cellSize/2, y - this.cellSize/2, x + this.cellSize/2, y - this.cellSize/2);
				}
				if (this.letterPositions[yPos][xPos]["s"] === true) {
					line(x - this.cellSize/2, y + this.cellSize/2, x + this.cellSize/2, y + this.cellSize/2);
				}
				if (this.letterPositions[yPos][xPos]["w"] === true) {
					line(x - this.cellSize/2, y - this.cellSize/2, x - this.cellSize/2, y + this.cellSize/2)
				}
				if (this.letterPositions[yPos][xPos]["e"] === true) {
					line(x + this.cellSize/2, y - this.cellSize/2, x + this.cellSize/2, y + this.cellSize/2)
				}
			}
		}
	}
}
