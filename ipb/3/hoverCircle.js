/**
 * @name HoverCircle
 *
 * @class
 *
 * @description A 2D object that represents a circle where mouse detection is performed
 *
 * @public {p5.Vector} pos - The 2D vector denoting position
*/
class HoverCircle extends HoverShape {
	constructor ({x, y, radius}) {
		super({x, y}); // inherits Node2D 
		this.radius = radius;
	}

	/** 
		* @method pointInShape
		* @description Detects whether a point is in the circle
	*/
	pointInShape(x, y) {
		return (
			this.distanceTo(createVector(x, y)) <= this.radius
		);
	}
}
