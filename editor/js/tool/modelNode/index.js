import { UIPanel } from "../../libs/ui.js";
import { SidebarScene } from "./Sidebar.Scene.js";
function ModelNode(editor) {
	const _self = this;
	_self.isShow = false;
	const container = new UIPanel();
	container.setClass("model-node");
	container.setId("modelNode");
	const sceneContainer = new SidebarScene(editor);
	container.add(sceneContainer);
	document.body.appendChild(container.dom);

	return _self;
}

ModelNode.prototype.show = function () {
	this.isShow = true;
	document.getElementById("modelNode").style = "transform: translateX(0px);";
	return this;
};
ModelNode.prototype.hide = function () {
	this.isShow = false;
	document.getElementById("modelNode").style = "transform: translateX(-302px);";
	this.hideAfter();
	return this;
};
ModelNode.prototype.toggle = function () {
	this.isShow ? this.hide() : this.show();
	return this;
};
ModelNode.prototype.hideAfter = function () {};

export default ModelNode;
