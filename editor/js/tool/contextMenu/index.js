import { UIPanel } from "../../libs/ui.js";
import Base from "../base.js";
import Label from "./label.js";
function Contextmenu(editor, viewport) {
	console.log("------------contextmenu", editor);
	const _self = this;
	const panelDom = viewport.container.dom || document;
	const container = new UIPanel();
	container.setId("contextMenu");
	container.setClass("context-menu");
	const labelContainer = new Label(editor, () => {
		contextMenuHide();
	});
	container.add(labelContainer.container);

	_self.position = null;
	_self.showMenu = function (e) {
		if (!editor.selected) return false;
		editor.selectDisabled = true;
		container.dom.style.cssText = `left: ${e.x}px; top:${e.y - 33}px; display: block;`;
		container.dom.addEventListener("mouseover", () => {
			panelDom.removeEventListener("mousedown", contextMenuHide);
			// panelDom.addEventListener("click", contextMenuHide);
		});
		container.dom.addEventListener("mouseout", () => {
			// panelDom.removeEventListener("click", contextMenuHide);
			panelDom.addEventListener("mousedown", contextMenuHide);
		});
	};

	function contextMenuHide() {
		container.dom.style.display = "none";
		editor.selectDisabled = false;
	}

	panelDom.addEventListener("contextmenu", _self.showMenu);
	viewport.container.add(container);
	return { prototype: _self };
}
export default Contextmenu;
