/**
 * @name Node2D
 *
 * @class
 *
 * @description A 2D mathematical representation of data (x, y)
 *
 * @public {p5.Vector} pos - The 2d vector denoting position
*/
class Node2D {
	constructor({x, y}) {
		this.pos = createVector(x, y);
	}

	/** 
		* @method distanceTo
		* @description calculates the distance to another 2d point
		* @param {p5.Vector} [pos2] - The second position.
	   * @param {p5.Vector} [pos1] - The first position. If null, automatically uses the class' pos attribute
	*/
	distanceTo(pos2, pos1=null) {
		if (pos1 === null) {
			pos1 = this.pos
		}
		return ((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2) ** 0.5;
	}

	/** 
		* @method distanceTo
		* @description calculates the angle to another 2d point
		* @param {p5.Vector} [pos2] - The second position.
	   * @param {p5.Vector} [pos1] - The first position. If null, automatically uses the class' pos attribute
	*/
	angleTo(pos2, pos1=null) {
		if (pos1 === null) {
			pos1 = this.pos
		}
		return Math.atan((pos2.x - pos1.x) / (pos2.y - pos1.y));
	}
}
