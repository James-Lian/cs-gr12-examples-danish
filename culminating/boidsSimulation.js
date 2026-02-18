const interactionManager = new InteractionManager({});

class BoidsSimulation {
	constructor({ maxBoids = 1000, speed=5 }) {
		this.maxBoids = maxBoids;
		this.boidSpeed = speed;
		this.boids = [];
		this.boidMasses = [];
		this.spatialPartitionsMap = [];
		this.boidSeparation = 30;
		this.boidAwareness = 60; // must be greater than boidSeparation

		this.date = "2018-03";
		this.boidTagColours = {};

		this.quadtreeVisible = false;

		this.interactionManager = new InteractionManager({});
		this.currTags = new Set();
	}

	initializeBoids(data) {
		this.boidMasses = [];
		this.boids = [];
		this.spatialPartitionsMap = [];
		
		for (let row of data) {
			let tagList = row.tags.split("|");
			for (let i = 0; i < tagList.length; i++) {
				if (!tagList[i]) {
					continue;
				}
				this.boidMasses.push({id: Number(row.id) + Number(i * 0.01), mass: row.score * (row.commentCount + row.answerCount)});
			}
		}
		
		for (let row of data) {
			let tagList = row.tags.split("|");
			for (let i = 0; i < tagList.length; i++) {
				if (!tagList[i]) {
					continue;
				}
				let boid = new Boid({
					x: random(width+1),
					y: random(height+1),
					id: Number(row.id) + Number(i * 0.01),
					date: row.creationDate,
					colour: this.boidTagColours[tagList[i]]
				});

				boid.tag = tagList[i];
				if (Number(row.score) * (Number(row.commentCount) + Number(row.answerCount)) >= 0) {
					boid.mass = map(Number(row.score) * (Number(row.commentCount) + Number(row.answerCount)), 0, Math.max(...this.boidMasses.map(x => x.mass)), 0, 1);
					boid.mass = Math.sqrt(boid.mass);
					boid.mass += 2
					boid.size = map(Number(row.score) * (Number(row.commentCount) + Number(row.answerCount)), 0, Math.max(...this.boidMasses.map(x => x.mass)), 0, 1);
					boid.size = Math.max(Math.min(Math.abs(Math.log(boid.size) / Math.log(8)), 7), 3)
				} else {
					boid.mass = map(Number(row.score) * (Number(row.commentCount) + Number(row.answerCount)), Math.min(...this.boidMasses.map(x => x.mass)), 0, -1, 0)
					boid.mass -= 3
					boid.size = Math.max(Math.min(Math.abs(Math.log(boid.size) / Math.log(8)), 7), 4)
				}
				this.boids.push(boid);
			}
		}

		this.boidMasses = this.insertionSort(this.boidMasses, "mass").reverse();
		this.boids = this.insertionSort(this.boids, "id");
	}
	
	quadtreeRecursiveSpatialPartitioning ({x1, y1, x2, y2, boids, capacity = 8}) {
		let boidsWithin = [];
		for (let boid of boids) {
			if (Number(boid.date.slice(0, 4)) > Number(this.date.slice(0, 4))) {
				continue;
			} else if (Number(boid.date.slice(0, 4)) == Number(this.date.slice(0, 4))) {
				if (Number(boid.date.slice(5, 7)) > Number(this.date.slice(5, 7))) {
					continue;
				}
			}
			if (boid.pos.x >= x1 && boid.pos.x < x2) {
				if (boid.pos.y >= y1 && boid.pos.y < y2) {
					boidsWithin.push(boid);			
				}
			}
		}
		// new quadtree needed
		if (boidsWithin.length > capacity) {
			// top-left quadtree
			this.quadtreeRecursiveSpatialPartitioning({
				x1: x1,
				y1: y1,
				x2: (x1 + x2) / 2,
				y2: (y1 + y2) / 2,
				boids: boidsWithin,
				capacity: capacity
			});
			// top-right quadtree
			this.quadtreeRecursiveSpatialPartitioning({
				x1: (x1 + x2) / 2,
				y1: y1,
				x2: x2,
				y2: (y1 + y2) / 2,
				boids: boidsWithin,
				capacity: capacity
			});
			// bottom-left quadtree
			this.quadtreeRecursiveSpatialPartitioning({
				x1: x1,
				y1: (y1 + y2) / 2,
				x2: (x1 + x2) / 2,
				y2: y2,
				boids: boidsWithin,
				capacity: capacity
			});
			// bottom-right quadtree
			this.quadtreeRecursiveSpatialPartitioning({
				x1: (x1 + x2) / 2,
				y1: (y1 + y2) / 2,
				x2: x2,
				y2: y2,
				boids: boidsWithin,
				capacity: capacity
			})
			return;
		}

		this.spatialPartitionsMap.push({x1: x1, y1: y1, x2: x2, y2: y2, boids: boidsWithin})
	}

	insertionSort(arr, prop) {
		for (let i = 1; i < arr.length; i++) {
			let key = arr[i];
			let j = i - 1;
			
			// Compare case-insensitively
			while (j >= 0 && arr[j][prop] > key[prop]) {
			  arr[j + 1] = arr[j];
			  j--;
			}
			arr[j + 1] = key;
		}
		return arr;
	}

	binarySearchReturnBoidById(arr, targetId) {
		let left = 0;
		let right = arr.length - 1;

		while (left <= right) {
			// Find the middle index
			const mid = Math.floor((left + right) / 2);
			const midId = arr[mid].id;

			if (midId === targetId) {
				return arr[mid];
			}
			if (midId < targetId) {
				left = mid + 1; // search right half 
			} else { 
				right = mid - 1; // search left half
			}
		}

		return null;
	}

	renderTagLegend() {
		let x = width - 200; // Position from the right
		let y = 60;          // Starting height
		let entryHeight = 20

		fill(255, 255, 255, 120);
		strokeWeight(0);
		if (this.currTags.length) {
			rect(x - 10, y - 14, 220, this.currTags.length * entryHeight + 10, 12);
		}
		
		// Loop through the tags and draw the color indicators
		let i = 0;
		for (let tag of this.currTags) {
			
			let currentY = y + (i * entryHeight) + 8;
			let col = tagColours[tag];
			
			// Draw the color circle
			fill(col);
			stroke(0);
			strokeWeight(1);
			ellipse(x + 5, currentY-5, 8, 8);
			
			// Draw the tag name
			fill(0);
			noStroke();
			textSize(16);
			textAlign(LEFT);
			// Truncate tag name if it's too long to fit the legend box
			let displayName = tag.length > 30 ? tag.substring(0, 28) + "..." : tag;
			text(displayName, x + 20, currentY);

			i++;
		}
	}
	
	// draw/render the boids
	update() {
		interactionManager.children.clear();
		
		this.spatialPartitionsMap = [];
		this.quadtreeRecursiveSpatialPartitioning({
			x1: 0, 
			y1: 0, 
			x2: width+1, 
			y2: height+1,
			boids: this.boids,
		});

		if (this.quadtreeVisible) {
			for (let rect of this.spatialPartitionsMap) {
				strokeWeight(2);
				stroke(101, 229, 48);
				line(rect.x2, rect.y1, rect.x2, rect.y2);
				line(rect.x1, rect.y2, rect.x2, rect.y2);
			}
		}

		let count = 0
		// construct a circle around the boid, and check if it intersects with any partitions
		for (let i=0; i < Math.min(this.maxBoids, this.boidMasses.length - 1); i++) {
			let boid = this.binarySearchReturnBoidById(this.boids, this.boidMasses[i]["id"]);
			
			boid.separationD = this.boidSeparation;
			boid.awarenessD = this.boidAwareness;
			boid.maxSpeed = this.boidSpeed;
			
			// don't draw any boids not part of the date;
			if (Number(boid.date.slice(0, 4)) > Number(this.date.slice(0, 4))) {
				continue;
			} else if (Number(boid.date.slice(0, 4)) == Number(this.date.slice(0, 4))) {
				if (Number(boid.date.slice(5, 7)) > Number(this.date.slice(5, 7))) {
					continue;
				}
			}
			
			if (count >= this.maxBoids) {
				boid.detectionDisabled = true;
				continue;
			}
			boid.detectionDisabled = false;

			const boidsToCheck = [];
			for (let rect of this.spatialPartitionsMap) {
				const x = boid.pos.x
				const y = boid.pos.y
				const radius = this.boidAwareness + 2;

				const closestX = Math.max(Math.min(x, rect.x2), rect.x1);
				const closestY = Math.max(Math.min(y, rect.y2), rect.y1);

				const dX = x - closestX;
				const dY = y - closestY;
				const d = (dX**2 + dY**2)**0.5;

				// add boids to checking
				if (d < radius) {
					for (let boidI of rect.boids) {
						// only add if boids date is less than current date (year-month)
						if (Number(boidI.date.slice(0, 4)) < Number(this.date.slice(0, 4))) {
							boidsToCheck.push(boidI);
						} else if (Number(boidI.date.slice(0, 4)) == Number(this.date.slice(0, 4))) {
							if (Number(boidI.date.slice(5, 7)) <= Number(this.date.slice(5, 7))) {
								boidsToCheck.push(boidI);
							}
						}
					}
				}
			}

			count++;
			boid.run(boidsToCheck);
			interactionManager.children.add(boid);
		}
		this.renderTagLegend();
		interactionManager.update();
	}

}
