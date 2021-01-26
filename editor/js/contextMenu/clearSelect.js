import { UIPanel } from "../libs/ui.js";
function clearSelect(editor, callback = () => {}) {
	const _self = this;
	const container = new UIPanel();
	container.setClass("title");
	container.setTextContent("清除选择");
	container.onClick(clickEvent);
	function clickEvent() {
		editor.deselect();
		callback();
	}
	return { container, clickEvent };
}

export default clearSelect;
