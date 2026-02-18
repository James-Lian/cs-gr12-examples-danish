/** 
 * @class Label
 * @description A text object that displays text
 * @public {String} [text] - The text that will be displayed
 * @public {Number} [x] - The x component of the position vector
 * @public {Number} [y] - The y component of the position vector
 * @public {Array} [colour] - An array that contains RGBA values
 * @public {Number} [fontSize] - The size of the displayed text
 * @public {textAlign} [align] - Sets the label's alignemnt
 * @public {Number} [outlineWeight] - Sets the weight of the text's outline
 */

class Label extends Node2D {
	constructor({
		text = "Title", x = 0, y = 0, colour = [255, 255, 255], fontSize = 32, align = CENTER, outlineWeight = 1 }) {
		super({ x, y });
		this.text = text;
		this.colour = colour;
		this.fontSize = fontSize;
		this.align = align;
		this.width = 0;
		this.height = 0;
		this.outlineWeight = outlineWeight;
	}

	/** 
	 * @method display
	 * @description The Label's equivalent of the update() function. Draws the label according to the object's propoerties. Run during the draw() function of p5.js
	 */
	display() {
		stroke(0); // Black outline
		strokeWeight(this.outlineWeight);
		// setting text colour, alignment, size, and position
		fill(...this.colour);
		textAlign(this.align);
		textSize(this.fontSize);
		text(this.text, this.pos.x, this.pos.y);

		// updating width and height variables which will be used for positioning
		this.width = textWidth(this.text);
		this.height = textAscent() + textDescent();
	}
}
