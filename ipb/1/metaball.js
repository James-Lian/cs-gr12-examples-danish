/** 
	* @class BlobSphere
	* @description An object representing a metaball's blob's position, colour, and text
	* @public {Number} [x] - The x component of the position vector
	* @public {Number} [y] - The y component of the position vector
	* @public {Number} [z] - The z component of the position vector
	* @public {Array} [colour] - An array that contains RGBA values
	* @public {String} [text] - A variable that contains the blob's label
*/

class BlobSphere {
    // use median to calculate radius
    constructor({x, y, z, radius, text, colour=[255, 0, 0, 255]}) {
        this.pos = createVector(x, y, z);
        this.radius = radius;
        this.colour = colour;
				this.text = text;
    }
	
		/** 
			* @method showLabel
			* @description Draws text for the blob's label
			* @param {Number} [x] - The x component of the position vector
			* @param {Number} [y] - The y component of the position vector
		*/
		showLabel(x, y) {
			stroke(0); // Black outline
		  strokeWeight(1); // 4-pixel thick outline
			fill(255);
			textSize(12);
			textAlign(this.align);
			text(this.text, x, y);
		}
}

/** 
	* @class MetaBallRenderer
	* @description An object that utilizes sphere trace ray marching to render a metaball from BlobSpheres stored in its scene parameter
	* @public {Array} [scene] - The array that holds all the BlobSpheres used to make a metaball
	* @public {Number} [posX] - The x component of the position vector
	* @public {Number} [posY] - The y component of the position vector
	* @public {Number} [dotSize] - The radius of the drawn dots
	* @public {Number} [spacingX] - The x spacing between drawn pixels
	* @public {Number} [spacingY] - The y spacing between drawn pixels
	* @public {Number} [resolutionX] - The x component of the resolution of the drawn metaball
	* @public {Number} [resolutionY] - The y component of the resolution of the drawn metaball
	* @public {Number} [camZ] - The distance of the orthographic camera from the scene's objects
	* @public {Number} [rotationSpd] - The speed at which the metaball rotates
	* @private {BlobSphere | null} - A property used to identify the collision between a ray and a blob
	* @private {Vector | null} - A property used to calculate the surface normal of the collided surface
	* @private {Vector} - A property used to set the direction of the light and shadows
	* @public {Number} [fieldStrength] - The "blobbiness" of the metaball
*/

// Raymarching
class MetaBallRenderer {
    constructor({scene=[], posX, posY, dotSize=1, spacingX, spacingY, resolutionX=300, resolutionY=300, camZ=20, rotationSpd=0.2, fieldStrength=0.8}) {
        this.scene = scene;
        this.pos = createVector(posX, posY);
        this.dotSize = dotSize;
        this.spacingX = spacingX;
        this.spacingY = spacingY;
        this.resolutionX = resolutionX;
        this.resolutionY = resolutionY;
        this.camZ = camZ;
				this.rotationSpd = rotationSpd;
				this._closestBall = null;
				this._surfaceNormal = null; // the direction of a surface - if the surfaceNormal and sunNormal point in the same direction, that means the surface is in shadow!
				this._sunNormal = createVector(-0.5, 1, -0.2); // the direction of the light
				this.fieldStrength = fieldStrength;
    }
		
		/** 
			* @method _sphereTrace
			* @description Performs the sphere trace ray marching for a ray to detect collisions and render objects
			* @param {p5.Vector} [origin] - The position vector of the origin
			* @param {p5.Vector} [dir] - The direction vector of the ray
			* @param {Number} [maxSteps] - The maximum amount of steps for the ray to march, higher numbers give better approximations
			* @param {Number} [maxDist] - The maximum distance a ray can travel
			* @param {Number} [epsilon] - The minimum distance between a ray's last step and a surface's normal before a collision is detected/approximated
			* @returns {Number} - The depth of the collision from the origin
		*/
    _sphereTrace(origin, dir, maxSteps, maxDist, epsilon) {
        // total distance of the current march
				let totalDist = 0;
			
				// complete the steps until either a collision is detected (the distance is smaller than epsilon) or the max number of steps is reached
        for (let i = 0; i < maxSteps; i++) {
            let p = p5.Vector.add(origin, p5.Vector.mult(dir, totalDist)); // p is the starting point of the current sphere
						let dist = this._metaballSDF(p);
						
            if (dist < epsilon) return totalDist;
            totalDist += dist;

            if (totalDist > maxDist) break;
        }
        return maxDist;
    }

    /** 
			* @method _metaballSDF
			* @description Calculates the signed distance field of the ray's last step compared to the BlobSphere's surface (negative means inside object, positive means outside)
			* @param {p5.Vector} [p] - The position vector for the ray's last step
			* @returns {Number} - The distance towards the ray's next step
		*/
    _metaballSDF(p) {
        let k = this.fieldStrength; // smoothing factor
        let d = 1e6;
				
				// calculates distance between p (current step position) and ALL other objects in the scene
        for (let ball of this.scene) {
            let distance = p5.Vector.dist(p, ball.pos) - ball.radius;
						if (distance < d) {
							this._closestBall = ball;
						}
						
						// performing smoothing operation in addition to finding the minimum distance for the next step in ray marching
						d = this._smoothMin(d, distance, k);
        }
				// calculating surface normal for shadows!!
				this._surfaceNormal = p5.Vector.sub(p, this._closestBall.pos).normalize();
        return d;
    }

    /** 
			* @method _smoothMin
			* @description Performs a cubic smoothing function to create that "blobby" effect
			* @param {dstA} [Number] - distance A
			* @param {dstB} [Number] - distance B
			* @param {Number} [k] - the smoothing factor
			* @returns {Number} - Returns the intersection between the two shapes, with the smoothing effect. This will be the distance for the ray's next step.
		*/
    _smoothMin(dstA, dstB, k) {
        let h = Math.max(k - Math.abs(dstA - dstB), 0) / k;
        return Math.min(dstA, dstB) - h * h * h * k * (1/6);
    }

		/** 
			* @method initializeBalls
			* @description Iterates through all BlobSpheres in the scene property and sets their radii to a relative quantity to each other between 1 and 2
		*/
    initializeBalls() {
				// resizes the balls to the visualization more understandable, resizing them relative to each other
        let ballSizes = []
        for (let ball of this.scene) {
            ballSizes.push(ball.radius);
        }

        for (let ball of this.scene) {
            ball.radius = map(ball.radius, Math.min(...ballSizes), Math.max(...ballSizes), 1, 2);
        }
    }
	
		/** 
			* @method _findCameraDimensions
			* @description Attempts to find a camera configuration that will fit all Blobs within the camera viewport
			* @returns - The new camera dimension
		*/
		_findCameraDimensions() {
				let ballCoords = [];
				for (let ball of this.scene) {
					ballCoords.push(Math.abs(ball.pos.x + ball.radius))
					ballCoords.push(Math.abs(ball.pos.y + ball.radius))
					ballCoords.push(Math.abs(ball.pos.z + ball.radius))
					ballCoords.push(Math.abs(ball.pos.x - ball.radius))
					ballCoords.push(Math.abs(ball.pos.y - ball.radius))
					ballCoords.push(Math.abs(ball.pos.z - ball.radius))
				}
			
				return Math.max(...ballCoords);
		}
		
		/** 
			* @method _rotateBalls
			* @description Rotates the 3d metaball object so you can see it from all sides
		*/
		_rotateBalls() {
				// around y-axis
				for (let ball of this.scene) {
					let x = ball.pos.x * Math.cos(this.rotationSpd) + ball.pos.z * Math.sin(this.rotationSpd);
					let y = ball.pos.y;
					let z = -ball.pos.x * Math.sin(this.rotationSpd) + ball.pos.z * Math.cos(this.rotationSpd);
 					ball.pos.x = x;
					ball.pos.y = y;
					ball.pos.z = z;
				}
		}

		/** 
			* @method update
			* @description The MetaBallRenderer's update function. Draws the metaball according to the object's parameters. Run this during the draw() function of p5
		*/
    update() {
				// constant variables that customize the ray marching
        const maxSteps = 30;
        const maxDist = 20 + this.camZ;
				const epsilon = 0.001;
				// calculating the number of pixels to be drawn based on resolution and spacing
        let numPixelsX = Math.floor(this.resolutionX / this.spacingX);
        let numPixelsY = Math.floor(this.resolutionY / this.spacingY);
        
				// setting camera dimensions
				let camDim = Math.floor(this._findCameraDimensions() / (1/1.2));
				
				// tracks which blobs have been labelled and which haven't
				let labelledBlobs = [];
				
				// iterate through each pixel - each pixel will be the starting point for a ray in our ray marching algorithm
        for (let x = 0; x < numPixelsX; x++) {
            for (let y = 0; y < numPixelsY; y++) {
                // the ray's position based on the screen's resolution
								let rayX = map(x, 0, numPixelsX, -this.resolutionX, this.resolutionX);
                let rayY = map(y, 0, numPixelsY, -this.resolutionY, this.resolutionY);
              	
								// the "actual" ray position, based on the original word vector numbers
								let rayXActual = map(x, 0, numPixelsX, -camDim, camDim);
								let rayYActual = map(y, 0, numPixelsY, -camDim, camDim);
							
								// the origin and direction
                let origin = createVector(rayXActual, rayYActual, this.camZ);
                let dir = createVector(0, 0, -1);
                let depth = this._sphereTrace(origin, dir, maxSteps, maxDist, epsilon);
								
								// the brightness is calculated based on depth of the collision - the further away, the darker
								let brightness = depth < maxDist ? map(depth, this.camZ, maxDist-8, 1, 0) : 0;
                
								if (this._closestBall) {
										// calculating similarity between light vector and surface normal vector to see if surface normal is in shadow
										let dot = this._sunNormal.dot(this._surfaceNormal);
										let magProduct = this._sunNormal.mag() * this._surfaceNormal.mag();
										let cosineSimilarity = dot / magProduct;	// cosine = 1 (same direction), 0 (orthogonal), -1 (opposite)
										
										// adding shadows
										let r = this._closestBall.colour[0];
										let g = this._closestBall.colour[1];
										let b = this._closestBall.colour[2];
										let a = this._closestBall.colour[3];
										if (cosineSimilarity > 0.3) {
												r *= (1-cosineSimilarity);
												g *= (1-cosineSimilarity);
												b *= (1-cosineSimilarity);
										}
									
										// drawing the pixels
										strokeWeight(0);
										fill(r * brightness, g * brightness, b * brightness, a)
										if (depth < maxDist) {
												circle(this.pos.x + rayX, this.pos.y + rayY, this.dotSize);
												if (labelledBlobs.includes(this._closestBall) === false) {
														this._closestBall.showLabel(this.pos.x + rayX + 30, this.pos.y + rayY)
														labelledBlobs.push(this._closestBall);
												}
										}
									
								}

            }
        }
				this._rotateBalls();
    }
}
