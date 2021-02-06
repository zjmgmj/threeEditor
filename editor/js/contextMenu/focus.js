import { UIPanel } from "../libs/ui.js";
function focus(editor, viewport, callback = () => {}) {
	const _self = this;
	const container = new UIPanel();
	container.setClass("title");
	container.setTextContent("焦点");
	container.onClick(clickEvent);
	// function clickEvent() {
	// 	const model = editor.selected;
	// 	viewport.prototype.controls.focus(model);
	// 	callback();
	// }
	function clickEvent() {
		const model = editor.selected || editor.selectedList;
		if (model.constructor.name === "Array") {
			const group = new THREE.Group();
			for (let i = 0; i < model.length; i++) {
				group.add(model[i].clone());
			}
			viewport.prototype.controls.focus(group);
		} else {
			viewport.prototype.controls.focus(model);
		}
		callback();
	}
	return { container, clickEvent };
}

export default focus;
