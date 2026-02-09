/** 
	* @name Player
	* 
	* @class
	*
	* @description An object representing the player, inherits from CellObject2D
	* 
   * @public {p5.Vector} [cellPos] - the cell position of the player, inherited from CellObject2D
	* @public {String} [collectedLetters] - A string containing all the collected letters
	* @public {Number} [position] - The position of the player
*/

// Description of the player’s position and letters collected by the player
class Player extends CellObject2D {
	constructor({cellX, cellY, collectedLetters=[]}) {
		super({cellX, cellY}); // inherits cellPos from CellObject2D
		this.collectedLetters = collectedLetters;
	}
	
	/** 
		* @method update
		* @description Draws the player every frame
	*/
  
	// Update the player’s info for every frame.
	update() {
	}
}
