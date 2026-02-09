/** 
	* @name Wall
	* 
	* @class
	* 
	* @description An object representing an instance of a wall in the maze, inherits from CellObject2D
   *
   * @public {p5.Vector} [cellPos] - the cell position of the wall, inherited from CellObject2D
	* @public {Number} [wallColor] - A number that will represent the colour from black to white
	* @public {Number} [position] - The position of the wall
	* @public {Number} [size] - The size of the wall
*/
class Wall extends CellObject2D {

	// constructor to initialize the attributes for objects (the maze)
	constructor({cellX, cellY, wallColor=[0], borderRounding={tl: 0, tr: 0, bl: 0, br: 0}}) {
		super({cellX, cellY});
		this.wallColor = wallColor;
		this.borderRounding = borderRounding;
	}
	
	/** 
		* @method update
		* @description Draws the wall every frame
	*/
	update() {
	}
}
