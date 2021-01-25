import * as THREE from "./libs/three.module.js"; // 引用基本的three.js库

import { Editor } from "./js/Editor.js";
import { Viewport } from "./js/Viewport.js"; // 中心视图
import { SidebarProject } from "./js/Sidebar.Project.js";
// import { Menubar } from "./js/Menubar.js"; // 顶部菜单
import { Resizer } from "./js/Resizer.js";
// import { VRButton } from "examples/jsm/webxr/VRButton.js";

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

	// const menubar = new Menubar(editor); // 顶部菜单
	// document.body.appendChild(menubar.dom);

	const resizer = new Resizer(editor);
	document.body.appendChild(resizer.dom);

	const toolBar = new Tool(editor, viewport); // 底部工具栏

	function onWindowResize() {
		editor.signals.windowResize.dispatch();
	}
	window.addEventListener("resize", onWindowResize, false);
	onWindowResize();

	$(".toolbar").on("click", function (e) {
		$(".toolbar").removeClass("active");
		$(this).addClass("active");
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
			$(".toolbar").removeClass("active");
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
				const lockControl = new toolBar.LockControl(editor, viewport);
				lockControl.start().unlockAfter = () => {
					$(".toolbar").removeClass("active");
				};
				break;
			case "3":
				// 模型节点
				toolBar.modelNode.toggle().hideAfter = () => {
					$(".toolbar").removeClass("active");
				};
				break;
			case "4":
				// 查看模型详情
				toolBar.modelDetail.toggle().hideAfter = () => {
					$(".toolbar").removeClass("active");
				};
				break;
			default:
				console.log("----------", flag);
				break;
		}
	}
	// loadModel({ path: "../models/420bd3c8-3bbd-486e-b39e-1d3193ef89ba/json/gimJson.json", format: "json" });
	// loadModel({
	// 	path: "../models/420bd3c8-3bbd-486e-b39e-1d3193ef89ba/0a4e4806-c09a-416f-8065-4e1cbcf39bc6.gltf",
	// }).then((res) => {
	// 	const model = res.scenes[0];
	// 	editor.addObject(model);
	// });
	// loadModel({
	// 	path: "../models/420bd3c8-3bbd-486e-b39e-1d3193ef89ba/0aaa8f8a-6476-4bba-9a42-621e0dc93165.gltf",
	// }).then((res) => {
	// 	const model = res.scenes[0];
	// 	editor.addObject(model);
	// });
	// loadModel({
	// 	path: "../models/420bd3c8-3bbd-486e-b39e-1d3193ef89ba/0b4b8c21-59a7-4b07-a2f0-127838f3c787.gltf",
	// }).then((res) => {
	// 	const model = res.scenes[0];
	// 	editor.addObject(model);
	// });
	// $.get("../models/420bd3c8-3bbd-486e-b39e-1d3193ef89ba/json/gimJson.json", function (res) {
	// 	debugger;
	// 	console.log(res);
	// 	loadJson(res.children);
	// });
	loadModel({ path: "../models/gltf/3d.gltf" })
		.then((res) => {
			const model = res.scenes[0];
			editor.addObject(model);
		})
		.catch((err) => {
			console.error("error-->>", err);
		});
}
Index();