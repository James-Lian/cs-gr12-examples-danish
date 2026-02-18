/**
 * @name HoverRectangle
 *
 * @class
 *
 * @description A 2D object that represents a rectangle where mouse detection is performed
 *
 * @public {p5.Vector} pos - The 2D vector denoting position
*/
class HoverRectangle extends HoverShape {
	constructor({x, y, tl=createVector(0, 0), br=createVector(0, 0)}) {
		super({x, y}); // inherits Node2D
		this.tl = tl; // relative to this.pos
		this.br = br; // relative to this.pos
	}

	/** 
		* @method pointInShape
		* @description Detects whether a point is in the rectangle
	*/
	pointInShape(x, y) {
		return (
			x >= this.tl.x && 
			x <= this.br.x &&
			y >= this.tl.y &&
			y <= this.br.y
	   );
	}
}
