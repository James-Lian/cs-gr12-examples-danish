/**
 * @name InteractiveObj
 *
 * @class
 *
 * @description A 2D object that can detect mouse hovers
 *
 * @public {p5.Vector} pos - The 2d vector denoting position
 * @public {Array} children - The array that contains and manages HoverShape classes, like HoverRectangle and HoverCircle
 * @public {Boolean} detectionDisabled - Disables or activates mouse hover detection
*/
class InteractiveObj extends Node2D {

	// maybe: add priority + SceneManager
	constructor({ x, y, children = [], detectionDisabled = true }) {
		super({x, y}); // inherits pos
		this.collisionChildren = children; // filled with HoverRectangle or HoverCircle
		this.detectionDisabled = detectionDisabled;
		// this.hitboxVisible = hitboxVisible;
	}

	/** 
		* @method mouseHover
		* @description Detects whether or not the mouse is hovering over the InteractiveObj's hitbox(es)
	*/
	mouseHover() {		
		if (!this.detectionDisabled) {
			for (let child of this.collisionChildren) {
				if (child.pointInShape(mouseX, mouseY)) {
					return true;
				}
			}
	
			return false;
		}
	}

	clicked() {
		
	}
}
