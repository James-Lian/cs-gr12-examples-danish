/** 
 * @class BlobSphere
 * @description An object that mathematically represents a metaball blob's position, colour, and text
 * @public {Number} [x] - The x component of the position vector
 * @public {Number} [y] - The y component of the position vector
 * @public {Number} [z] - The z component of the position vector
 * @public {Array} [colour] - An array that contains RGBA values
 * @public {String} [text] - A variable that contains the blob's label
 */

class BlobSphere extends Node3D {
	// use median to calculate radius
	constructor( {x, y, z, radius, text, colour = [255, 0, 0, 255]} ) {
		super({x, y, z});
		this.radius = radius;
		this.colour = colour;
		this.text = text;
		this.label = new HoverLabel({x: 0, y: 0, text: text});
	}

	/** 
	 * @method showLabel
	 * @description Draws text for the blob's label
	 * @param {Number} [x] - The x component of the position vector
	 * @param {Number} [y] - The y component of the position vector
	 */
	showLabel(x, y) {
		this.label.pos.set(x, y);
		this.label.display();
	}

	/** 
	 * @method distanceTo
	 * @description Calculates distance to another point
	 * @param {p5.Vector} [pos2] - The second position to calculate distance to
	 */
	distanceTo(pos2) {
		return this.pos.dist(pos2);
	}
}
