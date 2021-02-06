import * as THREE from "../../../libs/three.module.js"; // 引用基本的three.js库
import { UIPanel } from "../../libs/ui.js";
import Base from "../base.js";

function Label(editor, callback = () => {}) {
	const _self = this;
	const container = new UIPanel();
	container.setClass("title");
	container.setTextContent("标注");
	container.onClick(clickEvent);
	function createDom(model) {
		const dom = document.createElement("div");
		dom.className = "comment-box";
		const num = Math.random() * 1000;
		const closeId = `close_${parseInt(num)}`;
		const domTemp = `
      <textarea autofocus id=${model.id}></textarea>
      <div id=${closeId} class="label-close"><i class="icon iconfont iconclose"></i></div>
    `;
		dom.innerHTML = domTemp;

		const box = new THREE.Box3();
		box.setFromObject(model);
		/*
			5____4
		1/___0/|
		| 6__|_7
		2/___3/

		0: max.x, max.y, max.z
		1: min.x, max.y, max.z
		2: min.x, min.y, max.z
		3: max.x, min.y, max.z
		4: max.x, max.y, min.z
		5: min.x, max.y, min.z
		6: min.x, min.y, min.z
		7: max.x, min.y, min.z
    */
		const newPoint = box.getCenter();
		newPoint.y = box.max.y;
		model.worldToLocal(newPoint);
		const labelName = `label_${model.name}`;
		Base.createLabel({
			dom,
			editor,
			position: newPoint,
			parent: model,
			name: labelName,
		});
		document.getElementById(closeId).addEventListener("click", function () {
			Base.removeLabel({ name: labelName, parent: model });
		});
	}
	function clickEvent() {
		const model = editor.selected || editor.selectedList;
		if (model.constructor.name === "Array") {
			for (let i = 0; i < model.length; i++) {
				createDom(model[i]);
			}
		} else {
			createDom(model);
		}
		callback();
	}
	return { container, clickEvent };
}
export default Label;
