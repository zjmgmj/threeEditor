import { UIPanel } from "../../libs/ui.js";
import SidebarScene from "./Sidebar.Scene.js";
function ModelNode(editor) {
	const _self = this;
	_self.editor = editor;
	_self.isShow = false;
	_self.propertyName = "gimCode";
	_self.sidebarScene = new SidebarScene(editor);
	_self.sidebarScene.__proto__.refreshUI = function (list) {
		if (!list && !_self.domList) return false;
		if (list) _self.domList = list;
		const domList = list || _self.domList;
		const options = [];
		(function addObjects(list, pad) {
			var _uuids = [];
			for (var i = 0, l = list.length; i < l; i++) {
				var object = list[i];
				const model = _self.editor.scene.getObjectByName(object[_self.propertyName]);
				object.uuid = model?.uuid;
				if (object.uuid) _uuids.push(object.uuid);
				// if (object.name.indexOf("temp_") !== -1) continue;
				//if (_self.sidebarScene.nodeStates.has(object) === false) {
				//	_self.sidebarScene.nodeStates.set(object, false);
				//}

				var option = _self.sidebarScene.buildOption(object, true);
				option.style.paddingLeft = pad * 18 + "px";
				options.push(option);

				if (object.children) {
					object.childrenUuids = addObjects(object.children, pad + 1);
				}

				//if (_self.sidebarScene.nodeStates.get(object) === true) {
				//	addObjects(object.children, pad + 1);
				//}
			}
			return _uuids;
		})(domList, 0);
		_self.sidebarScene.outliner.setOptions(options);
		if (_self.editor.selected !== null) {
			_self.sidebarScene.outliner.setValue(_self.editor.selected.id);
		}
	};
	return _self;
}
ModelNode.prototype = {
	constructor: ModelNode,
	init() {
		const _self = this;
		const container = new UIPanel();
		container.setClass("model-node");
		container.setId("modelNode");
		_self.sidebarScene.init();
		container.add(_self.sidebarScene.container);
		document.body.appendChild(container.dom);
		_self.container = container;
	},
	refreshUI(data, propertyName) {
		if (propertyName) this.propertyName = propertyName;
		this.sidebarScene.refreshUI(data);
	},
	show() {
		this.isShow = true;
		document.getElementById("modelNode").style = "transform: translateX(0px);";
		return this;
	},
	hide() {
		this.isShow = false;
		document.getElementById("modelNode").style = "transform: translateX(-302px);";
		this.hideAfter();
		return this;
	},
	toggle() {
		this.isShow ? this.hide() : this.show();
		return this;
	},
	hideAfter() {},
};

export default ModelNode;
