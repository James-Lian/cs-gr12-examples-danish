/**
 * @name HoverShape
 *
 * @class
 *
 * @description A 2D object that represents a shape where mouse detection is performed
 *
 * @public {p5.Vector} pos - The 2d vector denoting position
*/
class HoverShape extends Node2D {
	constructor({x, y}) {
		super({x, y});
	}

	/** 
		* @method pointInShape
		* @description Detects whether a point is in the shape
	*/
	pointInShape () {
		throw new Error("pointInShape must be implemented by subclass");
	}
}
