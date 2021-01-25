import { UIPanel, UIButton, UICheckbox } from "./libs/ui.js";
import { RemoveObjectCommand } from "./commands/RemoveObjectCommand.js";
import { AddObjectCommand } from "./commands/AddObjectCommand.js";

function Toolbar(editor) {
	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setId("toolbar");

	// translate / rotate / scale

	// var translateIcon = document.createElement("img");
	// translateIcon.title = strings.getKey("toolbar/translate");
	// translateIcon.src = "images/translate.svg";

	var translateIcon = document.createElement("i");
	translateIcon.className = "iconfont icontranslate";

	var translate = new UIButton();
	translate.dom.className = "Button selected";
	translate.dom.appendChild(translateIcon);
	translate.onClick(function () {
		signals.transformModeChanged.dispatch("translate");
	});
	container.add(translate);

	// var rotateIcon = document.createElement("img");
	// rotateIcon.title = strings.getKey("toolbar/rotate");
	// rotateIcon.src = "images/rotate.svg";

	var rotateIcon = document.createElement("i");
	rotateIcon.className = "iconfont iconrotate";

	var rotate = new UIButton();
	rotate.dom.appendChild(rotateIcon);
	rotate.onClick(function () {
		signals.transformModeChanged.dispatch("rotate");
	});
	container.add(rotate);

	// var scaleIcon = document.createElement("img");
	// scaleIcon.title = strings.getKey("toolbar/scale");
	// scaleIcon.src = "images/scale.svg";

	var scaleIcon = document.createElement("i");
	scaleIcon.className = "iconfont iconscale";

	var scale = new UIButton();
	scale.dom.appendChild(scaleIcon);
	scale.onClick(function () {
		signals.transformModeChanged.dispatch("scale");
	});
	container.add(scale);

	// var scaleIcon = document.createElement("img");
	// scaleIcon.title = strings.getKey("toolbar/delete");
	// scaleIcon.src = "images/scale.svg";

	var delIcon = document.createElement("i");
	delIcon.className = "iconfont icondelete";

	var del = new UIButton();
	del.dom.appendChild(delIcon);
	del.onClick(function () {
		var object = editor.selected;

		if (object !== null && object.parent !== null) {
			editor.execute(new RemoveObjectCommand(editor, object));
		}
	});
	container.add(del);

	var copyIcon = document.createElement("i");
	copyIcon.className = "iconfont iconcopy";

	var copy = new UIButton();
	copy.dom.appendChild(copyIcon);
	copy.onClick(function () {
		var object = editor.selected;

		if (object.parent === null) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.execute(new AddObjectCommand(editor, object));
	});
	container.add(copy);

	var local = new UICheckbox(false);
	local.dom.title = strings.getKey("toolbar/local");
	local.onChange(function () {
		signals.spaceChanged.dispatch(this.getValue() === true ? "local" : "world");
	});
	container.add(local);

	//

	signals.transformModeChanged.add(function (mode) {
		translate.dom.classList.remove("selected");
		rotate.dom.classList.remove("selected");
		scale.dom.classList.remove("selected");

		switch (mode) {
			case "translate":
				translate.dom.classList.add("selected");
				break;
			case "rotate":
				rotate.dom.classList.add("selected");
				break;
			case "scale":
				scale.dom.classList.add("selected");
				break;
		}
	});

	return container;
}

export { Toolbar };
