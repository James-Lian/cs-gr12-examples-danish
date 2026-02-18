/* Each boid represents a post on the Quantum Computing Stack Exchange
- Score * (CommentCount + AnswerCount) ∝ Mass (mass is limited by a user-set factor, in boidsSimulation)
---> repulsion
---> also size
- Tags determines grouping

*/
class Boid extends InteractiveObj {	
	
	constructor({ x, y, id, date, colour, maxSpeed = 3, maxForce = 0.1, mass = 1, size = 3, tag = ""}) {
		super({x, y }); // pos
		this.acceleration = createVector(0, 0);
		this.velocity = createVector(random(-1, 1), random(-1, 1));

		this.mass = mass; // the posts with higher score + comments + answers gets more mass
		this.size = size;

		this.collisionChildren = [new HoverCircle({
			x: x,
			y: y,
			radius: this.size + 10
		})];

		this.maxSpeed = maxSpeed;
		this.maxForce = maxForce; // maximum steering force

		this.tag = tag;
		this.id = id;
		this.date = date;
		this.colour = colour;

		this.separationD = 20;
		this.awarenessD = 50;
	}

	run(boids) {
		this.flock(boids);
		this.physicsUpdate();
		this.borders();
		this.render();
	}

	applyForce(force) {
		if (this.mass <= 0) {
			force.mult(2);
		}
		this.acceleration.add(force);
	}

	flock(boids) {
		let separation = this.separate(boids);
		let alignment = this.align(boids);
		let cohesion = this.cohesion(boids);

		separation.mult(1.3);
		alignment.mult(2.0);
		cohesion.mult(1.8);

		this.applyForce(separation);
		this.applyForce(alignment);
		this.applyForce(cohesion);
	}

	borders() {
		if (this.pos.x < -this.size) {
			this.pos.x = width + this.size;
		} else if (this.pos.x > width + this.size) {
			this.pos.x = -this.size;
		}

		if (this.pos.y < -this.size) {
			this.pos.y = height + this.size;
		} else if (this.pos.y > height + this.size) {
			this.pos.y = -this.size;
		}
	}

	render() {
		let theta = this.velocity.heading() + radians(90);
		fill(...this.colour);
		stroke(0);
		
		this.collisionChildren[0].pos.set(this.pos.x, this.pos.y);
		// Mouse interaction logic
		let hover = this.mouseHover();
		if (hover) {
			stroke(255, 215, 0);
		}
		
		if (this.mass <= 0) {
			stroke(255, 0, 0);
		}
		strokeWeight(2);
		push();
		translate(this.pos.x, this.pos.y);
		rotate(theta);
		beginShape();
		vertex(0, -this.size * 2);
		vertex(-this.size, this.size * 2);
		vertex(this.size, this.size * 2);
		endShape(CLOSE);
		pop();
	}

	// managed by InteractionManager
	clicked() {
		interactionManager.popup(this.id);
	}

	seek(target) {
		let desired = p5.Vector.sub(target, this.pos);
		desired.normalize();
		desired.mult(this.maxSpeed);

		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxForce);
		return steer;
	}

	separate(boids) {
		let steer = createVector(0, 0);
		let count = 0;

		for (let boid of boids) {
			let d = p5.Vector.dist(this.pos, boid.pos);

			// 1. Determine how much we want to avoid this specific neighbor
			// If the neighbor is negative mass, we treat them as a high-priority "wall"
			let isRepulsor = boid.mass <= 0;
			let effectiveSeparation = isRepulsor ? this.separationD * 2 : this.separationD;

			if (d > 0 && d < effectiveSeparation) {
				let diff = p5.Vector.sub(this.pos, boid.pos);
				diff.normalize();

				// 2. Inverse square law: the closer they are, the exponentially harder we push away
				// This prevents them from ever actually "touching"
				diff.div(d);

				// 3. Weighting the push
				if (isRepulsor) {
					// If it's a repulsor, multiply the force significantly
					diff.mult(Math.abs(boid.mass) * 10);
				} else {
					diff.mult(Math.abs(boid.mass));
				}

				steer.add(diff);
				count++;
			}
		}

		if (count > 0) {
			steer.div(count);
		}

		if (steer.mag() > 0) {
			steer.normalize();
			steer.mult(this.maxSpeed);
			steer.sub(this.velocity);

			// If we are avoiding a repulsor, allow the boid to break its 
			// normal maxForce to escape "danger"
			steer.limit(this.maxForce * 2);
		}
		return steer;
	}

	align(boids) {
		let neighbourDistance = this.awarenessD;
		let sum = createVector(0, 0);
		let totalMass = 0;

		for (let boid of boids) {
			if (boid.tag === this.tag) {
				let d = p5.Vector.dist(this.pos, boid.pos);
				if (d > 0 && d < neighbourDistance) {
					let v = p5.Vector.mult(boid.velocity, boid.mass);
					sum.add(v);
					totalMass += boid.mass;
				}
			}
		}
		if (totalMass > 0) {
			sum.div(totalMass);
			sum.normalize();
			sum.mult(this.maxSpeed);
			let steer = p5.Vector.sub(sum, this.velocity);
			steer.limit(this.maxForce);
			return steer;
		} else {
			return createVector(0, 0);
		}
	}

	cohesion(boids) {
		let neighbourDistance = this.awarenessD;
		let sum = createVector(0, 0);
		let totalMass = 0;

		for (let boid of boids) {
			if (boid.tag === this.tag) {
				let d = p5.Vector.dist(this.pos, boid.pos);
				if (d > 0 && d < neighbourDistance) {
					let weightedPos = p5.Vector.mult(boid.pos, boid.mass);
					sum.add(weightedPos);
					totalMass += boid.mass;
				}
			}
		}
		if (totalMass > 0) {
			sum.div(totalMass);
			return this.seek(sum);
		} else {
			return createVector(0, 0);
		}
	}

	physicsUpdate() {
		this.velocity.add(this.acceleration);

		this.velocity.limit(this.maxSpeed);
		this.pos.add(this.velocity);

		this.acceleration.mult(0);
	}
}
