
/**
 * @name CellObject2D
 *
 * @class
 *
 * @description Mathematical representation of a 2D cell object with the cell position
 *
 * @public {p5.Vector} cellPos - position of the cell object.
 */
class CellObject2D {
	constructor({cellX, cellY}) {
		this.cellPos = createVector(cellX, cellY);
	}

	distanceToCell(cellSize) {}	
}
