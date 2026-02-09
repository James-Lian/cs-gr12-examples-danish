/**
 * @name         Word Game Maze (Group 5)
 * @description  Creates a word-based adventure game with maze

 * @author:      James, Andrew, Iat Seng, Max, Tarun
 * Created:      14-Oct-2025
 * Updated:      08-Dec-2025
*/

// declare all variables
let gameManager;
let player; 
let wall;

let wordnikApi;

let wordTable;
let riddlesAnswers = {};
let allWordsFromAnswers = [];
let byLength;
let byAlphabetical;

let playerSprite;
let spriteUp;
let spriteDown;
let spriteLeft;
let spriteRight;

let inventorySprite;
let inventoryActive = false;

// UI variables
let letterHintSelect;
let letterHintCheck;

function preload() {
  // Loading riddle questions from the .csv file.
	wordTable = loadTable("riddles.csv", "csv", "header", setupData, handleDataFailure);
	spriteUp = loadImage("up.png");
	spriteDown = loadImage("down.png");
	spriteLeft = loadImage("left.png");
	spriteRight = loadImage("right.png");
	playerSprite = spriteUp;

	inventorySprite = loadImage("pokebag.png");
}

function setupData() {
	let rows = wordTable.getRows();
	
	// getting table
	for (let i=0; i< wordTable.getRowCount(); i++) {
		let row = rows[i];
		riddlesAnswers[row.getString("riddle")] = row.getString("answer");
	}
}

// Console message printed if data was not loaded successfully

function handleDataFailure() {
	console.log("Failure loading words.")
}

/** 
	* @method swap
	* @description Utilized in the bubble sort function to "swap"/change the arrangements of elements within the list
	* @param {Array} [arr1] - The array that is being modified
	* @param {Number} [i1] - The first index
   * @param {Number} [i2] - The second index
*/
function swap(arr1, i1, i2) {
	let temp = arr1[i1];
	arr1[i1] = arr1[i2];
	arr1[i2] = temp;
}

// Custom Binary Search - Worst case performance O(log n), best case performance O(1)
/**
* @method customBinary
* @description Binary Search function that serves to display a given found word (based upon what the user has collected, currently chosen to be a give letter), in its
   * first occurance. A SORTED ARRAY (From "byAlphabetical" is being used, which was bubble sorted)
   * The worst case performance of the algorithm is O(log n) logrithmic time (Takes maximum amount of dataset splits; similar to
   * half-life), best case performance is O(1) singular time (if in the first search the middle term satisfies the condition), where n is the length of the array
* @param {Array} [arr] - The array that is being modified/sorted, in this case the ALREADY sorted (alphabetically) array.
* @param {String} [letter] - The letter (or letters in the future) that will be searched for (chosen condition).
*/
function findFirstWordStartingWith(arr, letter) {
    let left = 0;
    let right = arr.length - 1;
    let result = null;

    while (left <= right) {

 // Standard binary searching algorithim; Retrieves the middle index of the current search range (and turns it into lowercase, as the collected letters are lowercase)

        let mid = Math.floor((left + right) / 2);
        let word = arr[mid].toLowerCase();

        if (word.startsWith(letter)) {

            // Stores the satisfied result but continue searching left to find the first occurrence

            result = word;
            right = mid - 1;
        } else if (word < letter) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return result;
}

// custom bubble sort -- Worst case performance O(n^2), best case performance O(n)
/** 
	* @method customBubbleSort
	* @description The bubble sort function that utilizes the bubblesort algorithm to sort a list.
   * The worst case performance of the algorithm is O(n^2) quadratic time, best case performance is O(n) linear time, where n is the length of the array
	* @param {Array} [arr] - The array that is being modified/sorted
	* @param {Number} [keyFn] - The key function that modifies the value of the list elements being sorted - allows for sorting alphabetically, by lenght of words, etc.
*/
function customBubbleSort(arr, keyFn) {
   let result = [...arr];
	for (let i=0; i<result.length-1;i++) {
		if (keyFn(result[i]) > keyFn(result[i + 1])) {
			swap(result, i+1, i);
			for (let j = i + 1; j > 0; j--) {
	        if (keyFn(result[j]) < keyFn(result[j - 1])) {
	          swap(result, j, j - 1);
	        }
			}
		}
	}
	return result;
}

// custom setup
function setup() {
	
	// create canvas + background
	createCanvas(600, 600);
	background(100);
	
	// getting all letters + words
	allWordsFromAnswers = Object.values(riddlesAnswers);
	byLength = customBubbleSort(allWordsFromAnswers, word => word.length);
	byAlphabetical = customBubbleSort(allWordsFromAnswers, word => word.toLowerCase());
	let allLettersFromAnswers = allWordsFromAnswers.join("");
	allLettersFromAnswers = [...allLettersFromAnswers];

	letterHintSelect = createSelect();
	letterHintCheck = createCheckbox();
	for (let letter of [... new Set(allLettersFromAnswers)].sort()) {
		letterHintSelect.option(letter);
	}
	
	imageMode(CENTER);

	// instantiate new GameManager (manages game, score, and the maze layout)
	gameManager = new GameManager({
		sizeX: 30,
		sizeY: 30,
        x: int(width/2),
        y: int(height/2),
		letters: allLettersFromAnswers,
		cellSize: 60,
		maxScore: Object.keys(riddlesAnswers).length,
	});

	gameManager.initializeGame();
	
	// instantiate new player 
	player = new Player({
		cellX: 0, 
		cellY: 0
	});
	player.update();
	
	// instantiate a wall
	wall = new Wall({
		cellX: 0, 
		cellY: 0
	});
	wall.size = 20;
	wall.update();

	wordnikApi = new Wordnik("38uyf883jsifsh4pyy2o7ajucrc9fnh8m66stw5ghqjdo2coe");
}


let frameNum = 0;
// the random word that will be retrieved from Wordnik
let word = "";
// the definition retrieved from Wordnik
let definitions = "";
// the pronunciation of the word retrieved from RiTa
let ritaPronunciation = "";
// the part of speech of the word retireved from RiTa
let ritaPartOfSpeech = "";
function draw() {
	background(200);

	// display the word parts if all of them are non-null values
	if (word) {
		text(word, width / 2, 60);
	}
	if (definitions) {
		text(definitions, width / 2, 100);
	}
	textWrap(WORD);
	if (ritaPronunciation) {
		text(`Syllables: \n` + ritaPronunciation, width / 2, 140);
	}
	// part of speech - word classification (like noun, verb)
	if (ritaPartOfSpeech) {
		text("Part of speech: \n" + ritaPartOfSpeech, width / 2, 190)
	}
	
	// // generate a new random word, definition, pronunciation, and part of speech
	// if (frameNum % 180 === 0) {
	// 	wordnikApi.getRandomWord()
	// 		.then(response => response.json())
	// 		.then((data) => {
	// 			fill(0);
	// 			textAlign(CENTER);
	// 			console.log(data.word);
	// 			word = data.word;

	// 			// retrieving part of speech (verb, noun, etc.) from RiTa
	// 			ritaPartOfSpeech = RiTa.pos(data.word);
	// 			console.log("Part of Speech (RiTa): " + ritaPartOfSpeech);

	// 			// retrieving pronounciation
	// 			ritaPronunciation = RiTa.syllables(data.word)
	// 			console.log("Pronunciation (RiTa): " + ritaPronunciation);

	// 			// retrieving Wordnik definitions
	// 			wordnikApi.getDefinitions(data.word)
	// 		      .then(response => response.json())
	// 		      .then((data) => {
	// 			      fill(0);
	// 			      textAlign(CENTER);
	// 				   if (data && data[0]) {
	// 				      definitions = data[0].text;
	// 				   }
	// 		      })
	// 		})
	// }

	fill(0);
	// redraws player and wall every frame
	player.update();
	gameManager.gameUpdate();


	// HOLD Q TO DISPLAY SORTED WORDS
	if (keyIsDown(81) && !inventoryActive) {
		fill(0, 0, 0, 100);
		strokeWeight(0);
		rect(0, 0, width, 162)
		textSize(18);
		fill(255);
		textAlign(LEFT, TOP);
		textWrap(WORD);

		text("WORDS TO FIND (SORTED)... ", 3, 8, width-6);
		text("BY LENGTH: " + byLength.join(", "), 3, 35, width-6);
		text("ALPHABETICALLY: " + byAlphabetical.join(", "), 3, 83, width-6);

		fill(0);
		let playerInventoryLetter = "b"
		let firstLWord = findFirstWordStartingWith(byAlphabetical, playerInventoryLetter);
		
		if (firstLWord) {
			text(`FIRST WORD STARTING WITH ${playerInventoryLetter}: ` + firstLWord, 3, 200, width-6);
		}
	}

	if (letterHintCheck.checked()) {
		gameManager.pathfindingMode = true;
		gameManager.letterToFind = letterHintSelect.selected();
	} else {
		gameManager.pathfindingMode = false;
	}
	
	image(playerSprite, width / 2, height / 2, playerSprite.width / 2, playerSprite.height / 2)

	 // Displaying the found word related to the given letter (or string in the final game) in its first occurance. The given playerInventory is the comparison factor;
	// the function (which serves as the binary search) is being called with the sorted array "byAlphabetical" (which as the name suggests, is sorted alphabetically).
	


	if (inventoryActive) {
		fill(0, 120)
		rect(0, 0, width, height);
		drawInventory();
	}
	
	image(inventorySprite, width - 52, 30, 60, 60);
	frameNum += 1;
}

let userAnswer = "";
let progress = 0;
function drawInventory() {
	let row1 = "qwertyuiop";
	let row2 = "asdfghjkl";
	let row3 = "zxcvbnm";
	let keySize = 50;
	let keyHeight = 80;

	let answer = riddlesAnswers[Object.keys(riddlesAnswers)[progress]];
	let answerStartX = width/2 - answer.length * keySize / 2;
	let answerStartY = height/2 - 120
	for (let i=0; i < answer.length; i++) {
		stroke(255);
		textAlign(CENTER);
		textSize(22);
		line(answerStartX + i * keySize - 10, answerStartY, answerStartX + i * keySize + 10, answerStartY)
		stroke(0);
		fill(255);
		if (userAnswer[i]) {
			text(userAnswer[i], answerStartX + i * keySize, answerStartY - 30)
		}
	}

	stroke(0);
	textSize(22);
	textAlign(CENTER, TOP);
	textWrap(WORD);
	fill(255);
	text(Object.keys(riddlesAnswers)[progress], 0, 20, width - 100, height);
	
	let padding = 3;
	let startX = width / 2 - row1.length * keySize / 2;
	let startY = width / 2 - 30
	for (let i=0; i < row1.length; i++) {
		fill(255);
		if (gameManager.collectedLetters[row1[i]] === 0) {
			fill(180);
		}
		rect(startX + i * keySize + padding, startY + padding, keySize - padding * 2, keyHeight - padding * 2);
		fill(0);
		textSize(16);
		textAlign(CENTER, CENTER);
		textSize(22);
		text(row1[i], startX + i * keySize, startY, keySize, keyHeight);

		fill(0);
		circle(startX + i * keySize + keySize - 5, startY + keyHeight, 20);
		fill(255);
		textSize(15);
		text(gameManager.collectedLetters[row1[i]], startX + i * keySize + keySize - 5, startY + keyHeight);
	}

	startX = width / 2 - row2.length * keySize / 2;
	startY += keyHeight + padding
	for (let i=0; i < row2.length; i++) {
		fill(255);
		if (gameManager.collectedLetters[row2[i]] === 0) {
			fill(180);
		}
		rect(startX + i * keySize + padding, startY + padding, keySize - padding * 2, keyHeight - padding * 2);
		fill(0);
		textSize(16);
		textAlign(CENTER, CENTER);
		textSize(22);
		text(row2[i], startX + i * keySize, startY, keySize, keyHeight);

		fill(0);
		circle(startX + i * keySize + keySize - 5, startY + keyHeight, 20);
		fill(255);
		textSize(15);
		text(gameManager.collectedLetters[row2[i]], startX + i * keySize + keySize - 5, startY + keyHeight);
	}

	startX = width / 2 - row3.length * keySize / 2;
	startY += keyHeight + padding
	for (let i=0; i < row3.length; i++) {
		fill(255);
		if (gameManager.collectedLetters[row3[i]] === 0) {
			fill(180);
		}
		rect(startX + i * keySize + padding, startY + padding, keySize - padding * 2, keyHeight - padding * 2);
		fill(0);
		textSize(16);
		textAlign(CENTER, CENTER);
		textSize(22);
		text(row3[i], startX + i * keySize, startY, keySize, keyHeight);

		fill(0);
		circle(startX + i * keySize + keySize - 5, startY + keyHeight, 20);
		fill(255);
		textSize(15);
		text(gameManager.collectedLetters[row3[i]], startX + i * keySize + keySize - 5, startY + keyHeight);
	}
}

function inventory() {
	inventoryActive = !inventoryActive;
}

function mousePressed() {
	if (mouseX < width && mouseX > width - 100) {
		if (mouseY < 100 && mouseY > 0) {
			inventory();
		}
	}
}

function keyPressed() {
	if (!inventoryActive) {
		// player movement
		if (keyCode === LEFT_ARROW || key == "a") {
			gameManager.moveMaze(-1, 0);
			playerSprite = spriteLeft;
		}
		else if (keyCode === RIGHT_ARROW || key == "d") {
			gameManager.moveMaze(1, 0);
			playerSprite = spriteRight;
		}
		else if (keyCode === UP_ARROW || key == "w") {
			gameManager.moveMaze(0, -1);
			playerSprite = spriteUp;
		}
		else if (keyCode === DOWN_ARROW || key == "s") {
			gameManager.moveMaze(0, 1);
			playerSprite = spriteDown;
		}
	} else {
		if (keyCode === BACKSPACE) {
			userAnswer = userAnswer.slice(0, -1);
		}
		else if ("abcdefghijklmnopqrstuvwxyz".includes(key)) {
			let temp = {... gameManager.collectedLetters};
			for (let letter of userAnswer) {
				temp[letter] -= 1;
			}
			if (temp[key] !== 0) {
				userAnswer += key;
			}
			if (userAnswer === riddlesAnswers[Object.keys(riddlesAnswers)[progress]]) {
				progress += 1;
				for (let letter of userAnswer) {
					gameManager.collectedLetters[letter] -= 1
				}
				userAnswer = "";
			}
		}
	}
}
