/**
 * @name Node3D
 *
 * @class
 *
 * @description A 3D mathematical representation of data (x, y, z)
 *
 * @public {p5.Vector} pos - the 3d vector denoting position
*/
class Node3D {
	constructor({x, y, z}) {
		this.pos = createVector(x, y, z);
	}

	/** 
		* @method distanceTo
		* @description calculates the distance to another 3d point
		* @param {p5.Vector} [pos2] - The second position
	   * @param {p5.Vector} [pos1] - The first position. If null, automatically uses the class' pos attribute
	*/
	distanceTo(pos2, pos1=null) {
		if (pos1 === null) {
			pos1 = this.pos
		}
		return ((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2 + (pos2.z - pos1.z) ** 2) ** 0.5;
	}
}
