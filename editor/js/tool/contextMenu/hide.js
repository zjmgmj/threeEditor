import * as THREE from "../../../../build/three.module.js"; // 引用基本的three.js库
import { UIPanel } from "../../libs/ui.js";
import Base from "../base.js";

function Hide(editor, callback = () => {}) {
	const _self = this;
	const container = new UIPanel();
	container.setClass("title");
	container.setTextContent("隐藏选定项");
	container.onClick(clickEvent);
	function clickEvent() {
		debugger;
		console.log("-----------隐藏");
		const model = editor.selected;
		editor.hideModels.push({
			parentId: model.parent.id,
			model,
		});
		editor.removeObject(model);
		editor.deselect();
		callback();
	}
	return { container, clickEvent };
}
export default Hide;
