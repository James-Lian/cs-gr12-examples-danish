class InteractionManager {
	constructor({children = new Set()}) {
		this.popupActive = false;
		this.children = children;
		this.id = "";
	}

	linearSearchMouseEvents() {
		// array of InteractiveObj's
		for (let child of this.children) {
			if (child.mouseHover()) {
				child.clicked();
				break;
			}
		}
	}
	
	update() {
		if (mouseIsPressed) {
			this.linearSearchMouseEvents();
		}
	}

	popup(arg) {
		this.id = arg;
		this.popupActive = true;
	}
}
