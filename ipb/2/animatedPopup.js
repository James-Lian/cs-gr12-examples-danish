/** 
 * @class PopupBelow
 * @description A class that renders an animated popup display that slides in from the bottom of the screen
 * @public {p5.Vector} [pos] - The 2D position
 * @public {Number} [width] - The width of the popup
 * @public {Number} [height] - The height of the popup
 * @public {Number} [hangDur] - The duration for which the popup will be displayed
 * @public {Number} [animationDur] - The duration of the sliding animation
 * @public {Number} [startTime] - Records the start time of the animation to time the popup's animation
 * @public {Number} [offscreenY] - The position of the popup, offscreen
 * @public {String} [title] - The title of the popup
 * @public {String} [text] - The contents of the popup
*/
class PopupBelow extends Node2D {
	constructor({x=width / 1.3, y=height-200, startTime = millis(), hangDuration = 5, animationDuration = 0.2}) {
		super({x, y});
		this.width = width / 2;
		this.height = 400;
		this.hangDur = hangDuration;
		this.animationDur = animationDuration;
		this.startTime = startTime;
		this.offscreenY = height;
		this.title = "";
		this.text = "";
	}

	/** 
	 * @method animate
	 * @description Determines the position of the popup based on animation and timing. Returns false if the animation is over. 
	 */
	animate() {
		let currY;
		// slide in animation
		if (millis() - this.startTime <= this.animationDur * 1000) {
			currY = this.offscreenY + (this.pos.y - this.offscreenY) * (millis() - this.startTime) / (this.animationDur * 1000)
		}
		// hanging animation
		else if (millis() - this.startTime <= (this.animationDur + this.hangDur) * 1000) {
			currY = this.pos.y
		}
		// slide out animation
		else if (millis() - this.startTime <= (this.animationDur + this.hangDur * 2) * 1000) {
			currY = this.pos.y + (this.offscreenY - this.pos.y) * (millis() - this.startTime - this.animationDur * 1000 - this.hangDur * 1000) / (this.animationDur * 1000);
		}
		// animation over
		else {
			return false;
		}
		
	   // Give all corners a radius of 12.
		fill(0, 0, 53); // navy
		strokeWeight(0);
	   rect(this.pos.x - this.width / 2 - 10, currY, this.width + 20, this.height, 12);
		
		fill(255);
		textWrap(WORD);
		textAlign(LEFT);
		textSize(16);
		// the title
		textStyle(BOLD)
		text(this.title, this.pos.x - this.width / 2, currY + 20, this.width);
		// the contents
		textStyle(NORMAL)
		textSize(12);
		text(this.text, this.pos.x - this.width / 2, currY + 40, this.width);
		return true;
	}
}
