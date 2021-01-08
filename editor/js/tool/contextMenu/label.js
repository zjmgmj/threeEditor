import * as THREE from "../../../../build/three.module.js"; // 引用基本的three.js库
import { UIPanel } from "../../libs/ui.js";
// import Draw from "../draw.js";
import Base from "../base.js";

function Label(editor, callback = () => {}) {
	// const draw = new Draw(editor);
	const _self = this;
	// _self.model = editor.selected;
	const container = new UIPanel();
	container.setClass("title");
	container.setTextContent("标注");
	container.onClick(clickEvent);
	function clickEvent(e) {
		const model = editor.selected;
		console.log("-------标注", model);
		// const max = model.geometry.boundingBox.max;
		// { content, className, editor, position, dom, parent, name }
		const dom = document.createElement("div");
		dom.className = "comment-box";
		const domTemp = `<textarea autofocus id=${model.id}></textarea>`;
		// const domTemp = `<input type="text" name="" id=""/>`;
		// const domTemp = `<textarea name="neirong"> </textarea>`;
		dom.innerHTML = domTemp;
		Base.createLabel({
			dom,
			editor,
			position: new THREE.Vector3(0, 0, 0),
			parent: model,
			content: "测试",
			name: `label_${model.name}`,
		});
		callback();
	}
	return { container, clickEvent };
}
export default Label;
