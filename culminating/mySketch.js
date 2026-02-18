/**
 * @name         Quantum Computing Stack Exchange Data Visualization
 * @description  Creating a data visualization that visualizes the Quantum Computing Stack Exchange Community + ...

 * @authour      James Lian
 * Created:      2-Jan-2026
 * Updated:      22-Jan-2026
*/

/* Requirements
1. Two search algorithms ✅
2. Two sorting algorithms ✅
3. Big O Analysis for #1 and #2 ✅
4. Multi-level Inheritance ✅
5. Polymorphism ✅
6. Recursion ✅
7. User Interaction ✅
8. Visualization Showing Dataset Properties ✅
*/

// a csv of all Stack Exchange Posts in the Quantum Computing Stack Exchange
let PostsTable;
let onlyPostsData = [];
let tagPostCount = {
	"2018": {},
	"2019": {},
	"2020": {},
	"2021": {},
	"2022": {},
	"2023": {},
	"2024": {}
};

// Class Variables
let simulation;

// UI Variables
let yearSelect;
let allYears = [];
let allYearsAndMonths = {};
let prevYearSelected = "";
let monthSelect;
let prevMonthSelected = "";
let tagSelect;
let allTags = new Set();
let tagColours = {};
let prevTagSelected = "";

let boidSpeedSlider;
let boidSpeedSliderLabel;
let maxBoidsSlider;
let prevMaxBoids;
let maxBoidsSliderLabel;

let quadtreeCheck;
let quadtreeCheckLabel;
let prevQuadtreeCheck = false;

let topTagSlider;
let topTagSliderLabel;
let prevTopTagSlider = 0;

let popupCloseButton;

let yearTitle;

function preload() {
	PostsTable = loadTable("./QuantumStackExchange.csv", "csv", "header", setupData);
}

function setupData() {
	let rows = PostsTable.getRows();
	for (let i = 0; i < PostsTable.getRowCount(); i++) {
		let row = rows[i];

		let yearMonth = row.getString("CreationDate").slice(0, 7)
		let year = yearMonth.slice(0, 4);
		if (!allYears.includes(year)) {
			allYears.push(year);
			allYearsAndMonths[year] = [];
		}
		if (!allYearsAndMonths[year].includes(yearMonth.slice(5, 7))) {
			allYearsAndMonths[year].push(yearMonth.slice(5, 7));
		}

		let currTags = row.getString("Tags").split("|");
		for (let tag of currTags) {
			if (tag) {
				allTags.add(tag);
				if (tag in tagPostCount[year] === false) {
					tagPostCount[year][tag] = 0;
				}
				tagPostCount[year][tag] += 1;
			}
		}

		// boid data logic
		if (row.getString("PostType") === "1") {
			onlyPostsData.push({
				id: row.getString("Id"), 
				creationDate: yearMonth, 
				score: row.getString("Score"), 
				answerCount: row.getString("AnswerCount"), 
				commentCount: row.getString("CommentCount"),
				tags: row.getString("Tags"),
				title: row.getString("Title"),
				body: row.getString("Body")
			})
		}
	}

	allTags = Array.from(allTags);
	for (let tag of allTags) {
		tagColours[tag] = [random(256), random(256), random(256)];
	}
}

/** 
	* @method bubbleSortAlphabetical
	* @description Sorts a list of tags alphabetically. Big O Notation: O(n^2)
	* @param {p5.Vector} [arr] - array
*/
function bubbleSortAlphabetical(arr) {
	const result = [...arr];
	
	for (let i=0; i < result.length; i++) {
		for (let j=0; j < result.length - 1; j++) {
			if (result[j].toLowerCase() > result[j + 1].toLowerCase()) {
				const temp = result[j];
				result[j] = result[j + 1];
				result[j + 1] = temp;
			}
		}
	}
	return result;
}

function setup() {
	createCanvas(windowWidth, windowHeight-20);

	// UI Variable setup
	yearSelect = createSelect();
	for (let year of allYears) {
		yearSelect.option(year);
	}
	monthSelect = createSelect();
	for (let month of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']) {
		monthSelect.option(month)
	}

	tagSelect = createSelect();
	tagSelect.option("");
	for (let tag of bubbleSortAlphabetical(allTags)) {
		tagSelect.option(tag);
	}
	prevTagSelected = tagSelect.selected();
	
	boidSpeedSlider = createSlider(1, 10, 5, 1); // min, max, default, step
	boidSpeedSlider.position(20, 28);
	boidSpeedSlider.size(width / 8);
	boidSpeedSliderLabel = new Label({
		text: "Boid Speed: ",
		x: 20,
		y: 23,
		fontSize: 16,
		align: LEFT
	})
	
	maxBoidsSlider = createSlider(500, 10000, 2000, 500); // min, max, default, step
	maxBoidsSlider.position(20, 73);
	maxBoidsSlider.size(width / 8);
	maxBoidsSliderLabel = new Label({
		text: "Max Boids: ",
		x: 20,
		y: 68,
		fontSize: 16,
		align: LEFT
	})

	quadtreeCheck = createCheckbox();
	quadtreeCheck.position(width-42, height-28);
	quadtreeCheckLabel = new Label({
		text: "Visualize Recursive Quadtree \nSpatial Partioning ",
		x: width-20,
		y: height-58,
		fontSize: 16,
		align: RIGHT
	})

	topTagSlider = createSlider(5, 20, 20, 1);
	topTagSlider.position(width - 20 - width/8, 23);
	topTagSlider.size(width / 8);
	topTagSliderLabel = new Label({
		text: "Visualize the top " + topTagSlider.value() + " tags",
		x: width-20,
		y: 20,
		fontSize: 16,
		align: RIGHT
	})

	yearTitle = new Label({
		text: "XXXX-XX",
		x: width/2,
		y: 38,
		fontSize: 28,
		align: CENTER
	})
	
	// Everything else...
	simulation = new BoidsSimulation({});
	popupCloseButton = new InteractiveObj({
		x: 480,
		y: height - 250,
		children: [new HoverRectangle({tl: createVector(470, height - 260), br: createVector(490, height - 240)})]
	});
}

function linearSearchReturnPostById(arr, targetId) {
	for (let i=0; i < arr.length; i++) {
		if (Number(arr[i].id) === Number(targetId)) {
			return arr[i];
		}
	}
}

function draw() {
	background(120);

	if (maxBoidsSlider.value() !== prevMaxBoids) {
		simulation.maxBoids = maxBoidsSlider.value();
		prevMaxBoids = maxBoidsSlider.value();
	}

	simulation.update();
	renderUI();

	if (interactionManager.popupActive) {
		popupCloseButton.detectionDisabled = false;
		const post = linearSearchReturnPostById(onlyPostsData, Math.floor(interactionManager.id));
		if (post) {
			// popup background
			fill(28, 28, 30);
			strokeWeight(0);
			rect(-20, height - 280, 530, 280, 12);
	
			textSize(20);
			fill(250);
			stroke(255);
			strokeWeight(2);
			text("X", 488, height - 243);
	
			textAlign(LEFT);
			textSize(20)

			// popup details
			let postTitle = post.title.length > 48 ? post.title.substring(0, 46) + "..." : post.title
			strokeWeight(2);
			text(postTitle, 20, height - 243);
	
			strokeWeight(0);
			textSize(16);
			text("Score: " + post.score + " | Answer Count: " + post.answerCount + " | Comment Count: " + post.commentCount + " | " + post.creationDate, 20, height - 220, 468);

			let postTags = "Tags: " + post.tags.split("|").filter(x => x).join(", ")
			postTags = postTags.length > 62 ? postTags.substring(0, 60) + "..." : postTags;
			text(postTags, 20, height - 192, 468);
			
			let postBody = post.body.length > 330 ? post.body.substring(0, 328) + "..." : post.body
			textWrap(WORD);
			text(postBody, 20, height - 163, 468);
			
			if (popupCloseButton.mouseHover()) {
				if (mouseIsPressed) {
					popupCloseButton.detectionDisabled = true;
					interactionManager.popupActive = false;
				}
			}
		} else {
			popupCloseButton.detectionDisabled = true;
			interactionManager.popupActive = false;
		}
	}
}

function filterAndSendBoidData() {
	let selectedTag = tagSelect.selected();
	let topTags = [];

	if (selectedTag && selectedTag !== "") {
		topTags = [selectedTag];
	} else {
		const sortableArray = Object.entries(tagPostCount[yearSelect.selected()]);
		sortableArray.sort(([, a], [, b]) => b-a);
		topTags = sortableArray.slice(0, topTagSlider.value()).map(x => x[0]);
	}
	
	simulation.currTags = topTags;
	
	let dataToInclude = []
	for (let post of onlyPostsData) {
		if (Number(post.creationDate.slice(0, 4)) === Number(yearSelect.selected())) {
			let postTags = post.tags.split("|");
			let filteredTags = postTags.filter(tag => topTags.includes(tag));
			
			if (filteredTags.length > 0) {
				// Create a shallow copy so we don't overwrite the original 'onlyPostsData'
				let postCopy = { ...post };
				postCopy.tags = filteredTags.join("|"); 
				dataToInclude.push(postCopy);
			}
		}
	}

	simulation.maxBoids = maxBoidsSlider.value();
	simulation.boidSpeed = boidSpeedSlider.value();
	simulation.date = yearSelect.selected() + "-" + monthSelect.selected();
	simulation.boidTagColours = tagColours;
	
	simulation.initializeBoids(dataToInclude);
}

function renderUI() {
	// year and month selection logic
	if (yearSelect.selected() !== prevYearSelected) {
		for (let month of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']) {
			if (!allYearsAndMonths[yearSelect.selected()].includes(month)) {
				monthSelect.disable(month);
			} else {
				monthSelect.enable(month);
			}
		}

		simulation.date = yearSelect.selected() + "-" + monthSelect.selected();

		if (monthSelect.selected() === prevMonthSelected) {
			filterAndSendBoidData();
		}
		
		prevYearSelected = yearSelect.selected();
	}

	if (monthSelect.selected() !== prevMonthSelected) {
		filterAndSendBoidData();
		prevMonthSelected = monthSelect.selected();
	}

	// selected tag for v2 data visualization
	if (tagSelect.selected() !== prevTagSelected) {
		filterAndSendBoidData();
		prevTagSelected = tagSelect.selected();
	}

	// whether or not to display recursive quadtree visualization
	if (quadtreeCheck.checked() !== prevQuadtreeCheck) {
		simulation.quadtreeVisible = quadtreeCheck.checked();

		prevQuadtreeCheck = quadtreeCheck.checked();
	}

	if (topTagSlider.value() !== prevTopTagSlider) {
		filterAndSendBoidData();
		prevTopTagSlider = topTagSlider.value();
	}
	
	yearTitle.text = yearSelect.selected() + "-" + String(monthSelect.selected());
	boidSpeedSliderLabel.text = "Boid Speed: " + String(boidSpeedSlider.value());
	maxBoidsSliderLabel.text = "Max Boids: " + String(maxBoidsSlider.value());
	topTagSliderLabel.text = "Visualizing the top " + topTagSlider.value() + " tags"
	
	yearTitle.display();
	boidSpeedSliderLabel.display();
	maxBoidsSliderLabel.display();
	quadtreeCheckLabel.display();
	topTagSliderLabel.display();
}
