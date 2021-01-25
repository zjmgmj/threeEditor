import { Command } from "../Command.js";
import * as THREE from "../../libs/three.module.js";

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
function AddObjectCommand(editor, object) {
	Command.call(this, editor);

	this.type = "AddObjectCommand";

	this.object = object;
	if (object !== undefined) {
		this.name = "Add Object: " + object.name;
	}
}

AddObjectCommand.prototype = {
	execute: function () {
		this.editor.addObject(this.object);
		this.editor.select(this.object);
	},

	undo: function () {
		this.editor.removeObject(this.object);
		this.editor.deselect();
	},

	toJSON: function () {
		var output = Command.prototype.toJSON.call(this);
		output.object = this.object.toJSON();

		return output;
	},

	fromJSON: function (json) {
		Command.prototype.fromJSON.call(this, json);

		this.object = this.editor.objectByUuid(json.object.object.uuid);

		if (this.object === undefined) {
			var loader = new THREE.ObjectLoader();
			this.object = loader.parse(json.object);
		}
	},
};

export { AddObjectCommand };
