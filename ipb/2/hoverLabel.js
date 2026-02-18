/** 
 * @class HoverLabel
 * @description A special type of label that can detect mouse hovers and click events
 * @public {p5.Vector} [pos] - The 2D position
 * @public {Boolean} [detectionDisabled] - Sets whether or not the label is actively detecting mouse hovers and clicks
 * @public {String} [text] - The text of the label
 * @public {Array} [colour] - An array that contains RGBA values
 * @public {Number} [fontSize] - The size of the displayed text
 * @public {textAlign} [align] - Sets the label's alignemnt
 * @public {Number} [outlineWeight] - Sets the weight of the text's outline
 * @public {Array} [children] - Manages the HoverShapes responsible for detecting mouse hovers
 * @public {Number} [padding] - The padding added to the hover hitboxes
 * @public {Boolean} [clickActive] - Dictates whether the popup animation is currently active
 * @public {Boolean} [clicked] - Dictates whether the label has been clicked
 * @public {PopupBelow} [animatedPopup] - The dedicated popup that will be activated upon mouse click
 * @public {Wornik} [wornikApi] - The Wordnik API object
*/
class HoverLabel extends InteractiveObj {
	constructor({ text = "Title", x = 0, y = 0, detectionDisabled = false, colour = [255, 255, 255], fontSize = 12, align = CENTER, outlineWeight = 1 }) {
		super({ x, y, detectionDisabled });
		this.text = text;
		this.colour = colour;
		this.fontSize = fontSize;
		this.align = align;
		this.width = 0;
		this.height = 0;
		this.outlineWeight = outlineWeight;
		this.children.push(new HoverRectangle({x: x, y: y}))
		this.padding = 12;
		this.clickActive = false;
		this.clicked = false;
		this.animatedPopup = new PopupBelow({x: width/2})
		this.wordnikApi = new Wordnik("38uyf883jsifsh4pyy2o7ajucrc9fnh8m66stw5ghqjdo2coe");
	}

	/** 
	 * @method ifMouseHover
	 * @description Determines if the mouse is hovering over the label
   */
	ifMouseHover() {
		let mouseHover = super.ifMouseHover();
		if (mouseHover) {
			return true;
		} else {
			return false;
		}
	}

	/** 
	 * @method display
	 * @description Displays the hover label and manages mouse hover + clicks
	 */
	display() {
		
		this.children[0].tl.set(this.pos.x - this.width/2 - this.padding, this.pos.y - this.height/2 - this.padding);
		this.children[0].br.set(this.pos.x + this.width/2 + this.padding, this.pos.y + this.height/2 + this.padding);
		
		let finalText = this.text;
		
		let hover = this.ifMouseHover(); // check if mouse is hovering
		
		if (!this.clickActive) {
			if (hover) {
				stroke(255, 215, 0); // gold outline
				finalText += "\n" + RiTa.phones(this.text);
				
				if (mouseIsPressed && !this.clicked) {
					this.clicked = true;
					let definitions = "";
					let example = "";
				   let relatedWords = []
					
					this.wordnikApi.getDefinitions(this.text)
				      .then(response => response.json())
				      .then((data) => {
						   if (data && data[0]) {
						      definitions = data[0]["text"];
						   } else {
							   definitions = "Error retrieving definitions."
						   }
						   this.wordnikApi.getTopExample(this.text)
						      .then(response => response.json())
						      .then((data) => {
								   if (data) {
										example = data.text;
									} else {
									   example = "Error retrieving examples."
									}

								   this.wordnikApi.getRelatedWords(this.text)
								      .then(response => response.json())
								      .then((data) => {
										  if (data) {
											  for (let sublist of data) {
												  relatedWords.push(...sublist["words"]);
											  }
										  } 
									     this.animatedPopup.title = this.text + " | " + RiTa.pos(this.text);
									     this.animatedPopup.text = "Definition: " + definitions + "\n\n" + "Examples... " + example + "\n\n";
										  this.animatedPopup.text += relatedWords.length != 0 ? "Related words: " + relatedWords.join(", ") : "No related words found."
								        this.animatedPopup.startTime = millis();
								  	     this.clickActive = true;
									  })
							  })
				      });

				}
			} else {	
				stroke(0); // Black outline
			}
		} 
		// continually check for animation over
		else {
			this.clickActive = this.animatedPopup.animate();
			this.clicked = this.clickActive
		}
		
		strokeWeight(this.outlineWeight);
		// setting text colour, alignment, size, and position
		fill(...this.colour);
		textAlign(this.align);
		textSize(this.fontSize);
		text(finalText, this.pos.x, this.pos.y);

		this.width = textWidth(finalText);
		this.height = textAscent() + textDescent();
	}
}
