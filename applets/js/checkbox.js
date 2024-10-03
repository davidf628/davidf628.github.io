/******************************************************************************
 * Creates a check box to interact with on a JSX Graph board
 */
class CheckBox {

	/**************************************************************************
	 * Constructor for a JSXCheckBox object
	 * @param board {board} the board to place the checkbox
	 * @param xLoc {number} x location of the check box
	 * @param yLoc {number} y location of the check box
	 * @param label {string} text to attach to the check box
	 * @param checked {boolean} the default state of the check box
	 * @param onChange {function} what to do when the checkbox is clicked
	 * @param args {json} (optional)
	 */
	constructor(board, xLoc, yLoc, label, checked, onChange, args) {

		// Ensure that the proper inputs have been provided
		if (typeof(board) !== "object" || typeof(xLoc) !== "number" || typeof(yLoc) !== "number" || typeof(checked) !== "boolean") {
			console.warn('Invalid parameters for "JSXCheckbox" must include: board, xLoc, yLoc, label, and default status')
		}

		// Check to see if any additional arguments were passed
		if(args == undefined) {
			args = {};
		}
		args.fixed = typeof(args.fixed) === "boolean" ? args.fixed : true;

		// Create the checkbox
		this.checkbox = board.create('checkbox', [xLoc, yLoc, label], args);
		this.checkbox.rendNodeCheckbox.checked = checked;
		this.checkbox._value = checked;
        //this.checkbox.checked = checked;

		// Attach an onChange event function, if one was provided
		if (onChange) {
			JXG.addEvent(this.checkbox.rendNodeCheckbox, 'change', onChange, this.checkbox);
		}

	}

	/**************************************************************************
	 * Sets the current state of the check box
	 */
	set(value) {
		this.checkbox._value = value;
		this.checkbox.rendNodeCheckbox.checked = value;
        //this.checked = value;
	}

	/**************************************************************************
	 * Toggles the current state of the check box
	 */
	toggle() {
		if(this.checkbox.Value()) {
			this.set(true);
		} else {
			this.set(false);
		}
	}

	/**************************************************************************
	 * Returns true if the checkbox is currently checked
	 * @return {boolean}
	 */
	isChecked() {
		return this.checkbox.Value();
	}
}
