import { UIPanel } from "../../libs/ui.js";
import Base from "../base.js";
import Label from "./label.js";
import Hide from "./hide.js";
import Focus from "./focus.js";
import ClearSelect from "./clearSelect.js";
function Contextmenu(editor, viewport) {
	const _self = this;
	const panelDom = viewport.container.dom || document;
	const container = new UIPanel();
	container.setId("contextMenu");
	container.setClass("context-menu");

	const labelContainer = new Label(editor, () => {
		// 标注
		contextMenuHide();
	});
	const hideContainer = new Hide(editor, () => {
		// 隐藏
		contextMenuHide();
	});

	const showContainer = new showAllModel(editor, () => {
		//显示所有
		contextMenuHide();
	});

	const focusContainer = new Focus(editor, viewport, () => {
		console.log("聚焦");
		contextMenuHide();
	});

	const clearSelectContainer = new ClearSelect(editor, () => {
		console.log("清除选择");
		contextMenuHide();
	});

	container.add(labelContainer.container);
	container.add(hideContainer.container);
	container.add(focusContainer.container);
	container.add(clearSelectContainer.container);
	container.add(showContainer.container);

	_self.position = null;
	_self.showMenu = function (e) {
		const domList = container.dom.children;
		for (let i = 0; i < domList.length; i++) {
			const el = domList[i];
			if (!editor.selected) {
				if (el.textContent !== "显示所有对象") el.style.display = "none";
			} else {
				el.style.display = "block";
			}
		}
		editor.selectDisabled = true;
		container.dom.style.cssText = `left: ${e.x}px; top:${e.y - 33}px; display: block;`;
		container.dom.addEventListener("mouseover", () => {
			panelDom.removeEventListener("mousedown", contextMenuHide);
		});
		container.dom.addEventListener("mouseout", () => {
			panelDom.addEventListener("mousedown", contextMenuHide);
		});
	};

	function contextMenuHide() {
		container.dom.style.display = "none";
		editor.selectDisabled = false;
		viewport.render();
	}

	panelDom.addEventListener("contextmenu", _self.showMenu);
	viewport.container.add(container);

	function showAllModel(editor, callback = () => {}) {
		const _self = this;
		const container = new UIPanel();
		container.setClass("title");
		container.setTextContent("显示所有对象");
		container.onClick(clickEvent);
		function clickEvent() {
			debugger;
			console.log("-----------显示所有对象");
			const models = editor.hideModels;
			models.map(async (res) => {
				editor.addObject(res.model, editor.scene.getObjectById(res.parentId));
			});
			callback();
		}
		return { container, clickEvent };
	}

	return { prototype: _self };
}
export default Contextmenu;
