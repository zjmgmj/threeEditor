import { UIPanel, UIBreak } from "../../libs/ui.js";
import { UIOutliner } from "../../libs/ui.three.js";

function SidebarScene(editor) {
	this.editor = editor;
	this.signals = editor.signals;
	// var strings = editor.strings;
	return this;
}

SidebarScene.prototype = {
	init() {
		const _self = this;
		_self.container = new UIPanel();
		_self.container.setBorderTop("0");
		_self.container.setPaddingTop("20px");

		// outliner

		_self.nodeStates = new WeakMap();

		var ignoreObjectSelectedSignal = false;

		_self.outliner = new UIOutliner(_self.editor);
		_self.outliner.setId("outliner");
		_self.outliner.onChange(function () {
			ignoreObjectSelectedSignal = true;

			_self.editor.selectById(parseInt(_self.outliner.getValue()));

			ignoreObjectSelectedSignal = false;
		});
		_self.outliner.onDblClick(function () {
			_self.editor.focusById(parseInt(_self.outliner.getValue()));
		});
		_self.container.add(_self.outliner);
		_self.container.add(new UIBreak());

		// _self.refreshUI();

		_self.signals.sceneGraphChanged.addOnce(() => {
			_self.refreshUI.call(_self);
		});
		return _self;
	},
	buildOption: function (object, draggable) {
		const _self = this;
		var option = document.createElement("div");
		option.draggable = draggable;
		option.innerHTML = this.buildHTML(object);
		option.value = object.id;

		// opener

		if (this.nodeStates.has(object)) {
			var state = this.nodeStates.get(object);

			var opener = document.createElement("span");
			opener.classList.add("opener");

			if (object.children.length > 0) {
				opener.classList.add(state ? "open" : "closed");
			}

			opener.addEventListener(
				"click",
				function () {
					debugger;
					_self.nodeStates.set(object, _self.nodeStates.get(object) === false); // toggle
					_self.refreshUI();
					return false;
				},
				false
			);

			option.insertBefore(opener, option.firstChild);
		}

		return option;
	},
	escapeHTML(html) {
		return html
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	},
	getObjectType(object) {
		if (object.isScene) return "Scene";
		if (object.isCamera) return "Camera";
		if (object.isLight) return "Light";
		if (object.isMesh) return "Mesh";
		if (object.isLine) return "Line";
		if (object.isPoints) return "Points";
		return "Object3D";
	},
	buildHTML(object) {
		var html = `<span class="type ${this.getObjectType(object)}"></span> ${
			object.text || this.escapeHTML(object.Name) || this.escapeHTML(object.name) || object.type
		}`;

		html += this.getScript(object.uuid);

		return html;
	},
	getScript(uuid) {
		if (this.editor.scripts[uuid] !== undefined) {
			return ' <span class="type Script"></span>';
		}
		return "";
	},
	refreshUI() {
		// 更新节点
		const _self = this;
		var camera = this.editor.camera;
		var scene = this.editor.scene;

		var options = [];

		options.push(this.buildOption(camera, false));
		options.push(this.buildOption(scene, false));

		(function addObjects(objects, pad) {
			for (var i = 0, l = objects.length; i < l; i++) {
				var object = objects[i];
				if (object.name.indexOf("temp_") !== -1) continue;
				if (_self.nodeStates.has(object) === false) {
					_self.nodeStates.set(object, false);
				}

				var option = _self.buildOption(object, true);
				option.style.paddingLeft = pad * 18 + "px";
				options.push(option);

				if (_self.nodeStates.get(object) === true) {
					addObjects(object.children, pad + 1);
				}
			}
		})(scene.children, 0);

		_self.outliner.setOptions(options);

		if (_self.editor.selected !== null) {
			_self.outliner.setValue(_self.editor.selected.id);
		}
	},
};

export default SidebarScene;
