import * as THREE from "../../../libs/three.module.js"; // 引用基本的three.js库
import { UIPanel } from "../../libs/ui.js";
import Base from "../base.js";

function Hide(editor, callback = () => {}) {
	const _self = this;
	const container = new UIPanel();
	container.setClass("title");
	container.setTextContent("隐藏选定项");
	container.onClick(clickEvent);
	function hideModel(model) {
		editor.hideModels.push({
			parentId: model.parent ? model.parent.id : null,
			model,
		});
		editor.removeObject(model);
	}
	function clickEvent() {
		console.log("-----------隐藏");
		const model = editor.selected || editor.selectedList;
		if (model.constructor.name === "Array") {
			for (let i = 0; i < model.length; i++) {
				hideModel(model[i]);
			}
		} else {
			hideModel(model);
		}
		editor.deselect();
		callback();
	}
	return { container, clickEvent };
}
export default Hide;
