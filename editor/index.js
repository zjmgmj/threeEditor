import * as THREE from "../build/three.module.js"; // 引用基本的three.js库

import { Editor } from "./js/Editor.js";
import { Viewport } from "./js/Viewport.js"; // 中心视图
import { SidebarProject } from "./js/Sidebar.Project.js";
import { Menubar } from "./js/Menubar.js"; // 顶部菜单
import { Resizer } from "./js/Resizer.js";
// import { VRButton } from "../examples/jsm/webxr/VRButton.js";

import { Tool } from "./js/tool/index.js";
import { loadModel } from "./js/tool/load.js";

function Index() {
	window.URL = window.URL || window.webkitURL;
	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

	Number.prototype.format = function () {
		return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	};

	var editor = new Editor();

	window.editor = editor; // Expose editor to Console
	window.THREE = THREE; // Expose THREE to APP Scripts and Console

	const config = {
		sidebar: false,
		labelRenderer: true,
		transformControlsShow: false,
		optionPanel: false,
	};
	const viewport = new Viewport(editor, config);
	console.log(viewport);
	document.body.appendChild(viewport.container.dom);

	const sidebarProject = new SidebarProject(editor);
	console.log("sidebarProject", sidebarProject);

	const menubar = new Menubar(editor); // 顶部菜单
	document.body.appendChild(menubar.dom);

	const resizer = new Resizer(editor);
	document.body.appendChild(resizer.dom);

	const toolBar = new Tool(editor, viewport); // 底部工具栏

	function onWindowResize() {
		editor.signals.windowResize.dispatch();
	}
	window.addEventListener("resize", onWindowResize, false);
	onWindowResize();

	$(".toolbar").on("click", function (e) {
		const flag = this.getAttribute("data-flag");
		tool(flag, e);
	});
	function ranging(e) {
		// 测距
		const dom = document.getElementById("viewport");
		const postition = toolBar.base.screenToWorld({
			dom,
			x: e.clientX,
			z: e.clientY,
			editor,
		});
		toolBar.ranging.start(postition, () => {
			dom.removeEventListener("click", ranging);
		});
	}
	function tool(flag) {
		const dom = document.getElementById("viewport");
		dom.removeEventListener("click", ranging);
		switch (flag) {
			case "1":
				// 测距
				dom.addEventListener("click", ranging);
				break;
			case "2":
				// 视角切换
				new toolBar.LockControl(editor, viewport);
				break;
			default:
				console.log("----------", flag);
				break;
		}
	}
	loadModel({ path: "../models/gltf/3d.gltf" }).then((res) => {
		const model = res.scenes[0];
		editor.addObject(model);
	});
}
Index();
