import * as THREE from "../../build/three.module.js";

import { TransformControls } from "../../examples/jsm/controls/TransformControls.js"; // 变换控件

import { UIPanel } from "./libs/ui.js";

import { EditorControls } from "./EditorControls.js";
import { ViewportCamera } from "./Viewport.Camera.js";
import { ViewportInfo } from "./Viewport.Info.js";
import { ViewHelper } from "./Viewport.ViewHelper.js";

import { SetPositionCommand } from "./commands/SetPositionCommand.js";
import { SetRotationCommand } from "./commands/SetRotationCommand.js";
import { SetScaleCommand } from "./commands/SetScaleCommand.js";
import { Toolbar } from "./Toolbar.js"; // 左上角的 移动旋转按钮面板
import { CSS2DRenderer } from "../../examples/jsm/renderers/CSS2DRenderer.js";
import BoxHelper from "./tool/boxHelper.js";
function Viewport(
	editor,
	config = { sidebar: false, transformControlsShow: false, optionPanel: false, labelRenderer: false }
) {
	const _self = this;
	var signals = editor.signals;

	var container = new UIPanel();
	container.setId("viewport");
	container.setPosition("absolute");

	// container.add(new ViewportCamera(editor)); // 场景中添加相机 右上角相机切换
	container.add(new ViewportInfo(editor)); // 场景左下角显示信息
	// let  = container.dom;
	//

	var renderer = null;
	var labelRenderer = null;
	var pmremGenerator = null;
	var pmremTexture = null;

	var camera = editor.camera;
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;
	var showSceneHelpers = true;

	var objects = [];

	// helpers

	var grid = new THREE.GridHelper(1000, 500, 0x444444, 0x888888); // 网格
	grid.position.set(0, -0.5, 0);
	var viewHelper = new ViewHelper(camera, container); // 右下角 坐标控件

	//

	var box = new THREE.Box3();

	// 模型选中显示边框
	var selectionBox = new THREE.BoxHelper();
	// debugger;
	// selectionBox.update = function (object) {
	// 	console.log("--------------------object", this.object);
	// };
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add(selectionBox);

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.
	// CSS2DRenderer
	var controls = new EditorControls(camera, container.dom);
	if (config.labelRenderer) {
		labelRenderer = new CSS2DRenderer();
		// container.dom = labelRenderer.domElement;
		labelRenderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
		labelRenderer.domElement.style.position = "absolute";
		labelRenderer.domElement.style.top = "0px";
		container.dom.appendChild(labelRenderer.domElement);
	}
	controls.addEventListener("change", function () {
		console.log("controls---change");
		// toggleOptionPanel();

		signals.cameraChanged.dispatch(camera);
		// if (config.sidebar) signals.refreshSidebarObject3D.dispatch(camera);
		signals.refreshSidebarObject3D.dispatch(camera);
	});
	viewHelper.controls = controls;

	var objectPositionOnDown = null;
	var objectRotationOnDown = null;
	var objectScaleOnDown = null;
	var transformControls = null;
	if (config.transformControlsShow) {
		transformControls = new TransformControls(camera, container.dom);
		transformControls.addEventListener("change", function () {
			// 监听场景 控制器对模型操作
			console.log("transformControls----change");
			var object = transformControls.object;

			if (object !== undefined) {
				selectionBox.setFromObject(object);

				var helper = editor.helpers[object.id];

				if (helper !== undefined && helper.isSkeletonHelper !== true) {
					helper.update();
				}

				if (config.sidebar) signals.refreshSidebarObject3D.dispatch(object); // 更新侧边栏模型信息
			}

			render();
		});
		transformControls.addEventListener("mouseDown", function () {
			// 监听鼠标对 控制器操作
			console.log("transformControls----mouseDown");
			toggleOptionPanel();
			var object = transformControls.object;

			objectPositionOnDown = object.position.clone();
			objectRotationOnDown = object.rotation.clone();
			objectScaleOnDown = object.scale.clone();

			controls.enabled = false;
		});
		transformControls.addEventListener("mouseUp", function () {
			// 监听鼠标对 控制器操作
			console.log("transformControls------------mouseUp");
			var object = transformControls.object;

			if (object !== undefined) {
				// 操作模式
				switch (transformControls.getMode()) {
					case "translate":
						if (!objectPositionOnDown.equals(object.position)) {
							editor.execute(
								new SetPositionCommand(editor, object, object.position, objectPositionOnDown)
							);
						}

						break;

					case "rotate":
						if (!objectRotationOnDown.equals(object.rotation)) {
							editor.execute(
								new SetRotationCommand(editor, object, object.rotation, objectRotationOnDown)
							);
						}

						break;

					case "scale":
						if (!objectScaleOnDown.equals(object.scale)) {
							editor.execute(new SetScaleCommand(editor, object, object.scale, objectScaleOnDown));
						}

						break;
				}
			}

			controls.enabled = true;
		});
		sceneHelpers.add(transformControls); // 场景中加入转换控件
	}

	// object picking

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	// events

	function updateAspectRatio() {
		// 相机更新
		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();
	}

	function getIntersects(point, objects) {
		// 获取鼠标选择中的模型
		mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
		raycaster.setFromCamera(mouse, camera);

		return raycaster.intersectObjects(objects);
	}

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition(dom, x, y) {
		// 获取鼠标在场景中坐标
		var rect = dom.getBoundingClientRect();
		return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
	}

	function handleClick() {
		// 鼠标点击场景
		console.log("handleClick");
		if (onDownPosition.distanceTo(onUpPosition) === 0) {
			var intersects = getIntersects(onUpPosition, objects);

			if (intersects.length > 0) {
				var object = intersects[0].object;

				if (object.userData.object !== undefined) {
					// helper
					editor.select(object.userData.object);
				} else {
					editor.select(object);
				}
			} else {
				editor.select(null);
			}
			render();
		}
		toggleOptionPanel("show");
	}

	function onMouseDown(event) {
		// event.preventDefault();
		if (event.button !== 0 || editor.selectDisabled) return false;
		console.log("---onMouseDown", event);
		var array = getMousePosition(container.dom, event.clientX, event.clientY);
		onDownPosition.fromArray(array);
		console.log("---------------onDownPosition", onDownPosition);
		document.addEventListener("mouseup", onMouseUp, false);
	}

	function onMouseUp(event) {
		// 监听鼠标事件
		var array = getMousePosition(container.dom, event.clientX, event.clientY);
		onUpPosition.fromArray(array);

		handleClick(event);

		document.removeEventListener("mouseup", onMouseUp, false);
	}

	function onTouchStart(event) {
		var touch = event.changedTouches[0];

		var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
		onDownPosition.fromArray(array);

		document.addEventListener("touchend", onTouchEnd, false);
	}

	function onTouchEnd(event) {
		// 监听移动端点击事件
		var touch = event.changedTouches[0];

		var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
		onUpPosition.fromArray(array);

		handleClick();

		document.removeEventListener("touchend", onTouchEnd, false);
	}

	function onDoubleClick(event) {
		// 双击事件
		var array = getMousePosition(container.dom, event.clientX, event.clientY);
		onDoubleClickPosition.fromArray(array);

		var intersects = getIntersects(onDoubleClickPosition, objects);

		if (intersects.length > 0) {
			var intersect = intersects[0];

			signals.objectFocused.dispatch(intersect.object);
		}
	}
	function toggleOptionPanel(type) {
		// 显示操作面板
		if (!config.optionPanel || !config.transformControlsShow) return false;
		const dom = document.getElementById("toolbar");
		if (!type && !dom) return false;
		if (!type && dom) {
			dom.style.opacity = "0";
			return false;
		}
		const model = transformControls.object;
		if (!model) return false;
		const { x, y } = worldToScreen(model.position);
		if (dom) {
			dom.style.opacity = "1";
			dom.style.left = `${x}px`;
			dom.style.top = `${y}px`;
			return false;
		}
		var toolbar = new Toolbar(editor);
		toolbar.dom.style.cssText = `left: ${x}px; top:${y}px`;
		document.body.appendChild(toolbar.dom);
	}

	function worldToScreen(worldPosition) {
		const worldVector = new THREE.Vector3(worldPosition.x, worldPosition.y, worldPosition.z);
		const standardVector = worldVector.project(camera); //世界坐标转标准设备坐标
		const a = window.innerWidth / 2;
		const b = window.innerHeight / 2;
		const x = Math.round(standardVector.x * a + a); //标准设备坐标转屏幕坐标
		const y = Math.round(-standardVector.y * b + b); //标准设备坐标转屏幕坐标
		return { x, y };
	}
	container.dom.addEventListener("mousedown", onMouseDown, false);
	container.dom.addEventListener("touchstart", onTouchStart, false);
	container.dom.addEventListener("dblclick", onDoubleClick, false);

	// signals 事件控制

	signals.editorCleared.add(function () {
		//
		controls.center.set(0, 0, 0);
		render();
	});
	if (transformControls) {
		signals.transformModeChanged.add(function (mode) {
			console.log("切换操作模式", mode);
			transformControls.setMode(mode);
		});

		signals.snapChanged.add(function (dist) {
			console.log("snapChanged", dist);
			transformControls.setTranslationSnap(dist);
		});

		signals.spaceChanged.add(function (space) {
			// 坐标变换
			console.log("坐标变换", space);
			transformControls.setSpace(space);
		});
	}

	signals.rendererUpdated.add(function () {
		console.log("rendererUpdated");
		scene.traverse(function (child) {
			if (child.material !== undefined) {
				child.material.needsUpdate = true;
			}
		});

		render();
	});

	signals.rendererChanged.add(function (newRenderer) {
		console.log("rendererChanged", newRenderer);
		if (renderer !== null) {
			renderer.dispose();
			pmremGenerator.dispose();
			pmremTexture = null;

			container.dom.removeChild(renderer.domElement);
		}

		renderer = newRenderer;

		renderer.setClearColor(0xaaaaaa);

		if (window.matchMedia) {
			var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			mediaQuery.addListener(function (event) {
				renderer.setClearColor(event.matches ? 0x333333 : 0xaaaaaa);
				updateGridColors(grid, event.matches ? [0x888888, 0x222222] : [0x282828, 0x888888]);

				render();
			});

			renderer.setClearColor(mediaQuery.matches ? 0x333333 : 0xaaaaaa);
			updateGridColors(grid, mediaQuery.matches ? [0x888888, 0x222222] : [0x282828, 0x888888]);
		}

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

		pmremGenerator = new THREE.PMREMGenerator(renderer);
		pmremGenerator.compileEquirectangularShader();

		container.dom.appendChild(renderer.domElement);

		render();
	});

	signals.sceneGraphChanged.add(function () {
		console.log("sceneGraphChanged");
		render();
	});

	signals.cameraChanged.add(function () {
		render();
	});

	signals.objectSelected.add(function (object) {
		// 模型选择
		console.log("模型选择", object);
		selectionBox.visible = false;
		if (transformControls) transformControls.detach();

		if (object !== null && object !== scene && object !== camera) {
			box.setFromObject(object);

			if (box.isEmpty() === false) {
				selectionBox.setFromObject(object);
				selectionBox.visible = true;
			}

			if (transformControls) transformControls.attach(object);
			toggleOptionPanel("show");
		} else {
			toggleOptionPanel();
		}
		render();
	});

	signals.objectFocused.add(function (object) {
		console.log("focused", object);
		controls.focus(object);
	});

	signals.geometryChanged.add(function (object) {
		console.log("geometry变化", object);
		if (object !== undefined) {
			selectionBox.setFromObject(object);
		}

		render();
	});

	signals.objectAdded.add(function (object) {
		console.log("objectAdded", object);
		object.traverse(function (child) {
			objects.push(child);
		});
	});

	signals.objectChanged.add(function (object) {
		console.log("objectChanged", object);
		if (editor.selected === object) {
			selectionBox.setFromObject(object); // 选中模型
		}

		if (object.isPerspectiveCamera) {
			object.updateProjectionMatrix();
		}

		if (editor.helpers[object.id] !== undefined) {
			editor.helpers[object.id].update();
		}

		render();
	});

	signals.objectRemoved.add(function (object) {
		// 删除模型
		console.log("删除模型", object);
		controls.enabled = true; // see #14180
		if (object === transformControls?.object) {
			transformControls.detach();
		}

		object.traverse(function (child) {
			objects.splice(objects.indexOf(child), 1);
		});
	});

	signals.helperAdded.add(function (object) {
		console.log("helperAdded", object);
		var picker = object.getObjectByName("picker");

		if (picker !== undefined) {
			objects.push(picker);
		}
	});

	signals.helperRemoved.add(function (object) {
		console.log("helperRemoved", object);
		var picker = object.getObjectByName("picker");

		if (picker !== undefined) {
			objects.splice(objects.indexOf(picker), 1);
		}
	});

	signals.materialChanged.add(function () {
		console.log("materialChanged");
		render();
	});

	signals.animationStopped.add(function () {
		console.log("animationStopped");
		render();
	});

	// background

	signals.sceneBackgroundChanged.add(function (
		backgroundType,
		backgroundColor,
		backgroundTexture,
		backgroundEquirectangularTexture,
		environmentType
	) {
		console.log("sceneBackgroundChanged", backgroundType);
		pmremTexture = null;

		switch (backgroundType) {
			case "None":
				scene.background = null;

				break;

			case "Color":
				scene.background = new THREE.Color(backgroundColor);

				break;

			case "Texture":
				if (backgroundTexture) {
					scene.background = backgroundTexture;
				}

				break;

			case "Equirectangular":
				if (backgroundEquirectangularTexture) {
					pmremTexture = pmremGenerator.fromEquirectangular(backgroundEquirectangularTexture).texture;

					var renderTarget = new THREE.WebGLCubeRenderTarget(512);
					renderTarget.fromEquirectangularTexture(renderer, backgroundEquirectangularTexture);
					renderTarget.toJSON = function () {
						return null;
					}; // TODO Remove hack

					scene.background = renderTarget;
				}

				break;
		}

		if (environmentType === "Background") {
			scene.environment = pmremTexture;
		}

		render();
	});

	// environment

	signals.sceneEnvironmentChanged.add(function (environmentType) {
		console.log("sceneEnvironmentChanged", environmentType);
		switch (environmentType) {
			case "None":
				scene.environment = null;
				break;
			case "Background":
				scene.environment = pmremTexture;
				break;
		}

		render();
	});

	// fog

	signals.sceneFogChanged.add(function (fogType, fogColor, fogNear, fogFar, fogDensity) {
		console.log("sceneFogChanged", fogType);
		switch (fogType) {
			case "None":
				scene.fog = null;
				break;
			case "Fog":
				scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
				break;
			case "FogExp2":
				scene.fog = new THREE.FogExp2(fogColor, fogDensity);
				break;
		}

		render();
	});

	signals.sceneFogSettingsChanged.add(function (fogType, fogColor, fogNear, fogFar, fogDensity) {
		console.log("sceneFogSettingsChanged");
		switch (fogType) {
			case "Fog":
				scene.fog.color.setHex(fogColor);
				scene.fog.near = fogNear;
				scene.fog.far = fogFar;
				break;
			case "FogExp2":
				scene.fog.color.setHex(fogColor);
				scene.fog.density = fogDensity;
				break;
		}

		render();
	});

	signals.viewportCameraChanged.add(function () {
		console.log("viewportCameraChanged");
		var viewportCamera = editor.viewportCamera;

		if (viewportCamera.isPerspectiveCamera) {
			viewportCamera.aspect = editor.camera.aspect;
			viewportCamera.projectionMatrix.copy(editor.camera.projectionMatrix);
		} else if (viewportCamera.isOrthographicCamera) {
			// TODO
		}

		// disable EditorControls when setting a user camera

		controls.enabled = viewportCamera === editor.camera;

		render();
	});

	//

	signals.windowResize.add(function () {
		updateAspectRatio();

		renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
		if (labelRenderer) labelRenderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

		render();
	});

	signals.showGridChanged.add(function (showGrid) {
		grid.visible = showGrid;
		render();
	});

	signals.showHelpersChanged.add(function (showHelpers) {
		showSceneHelpers = showHelpers;
		transformControls.enabled = showHelpers;

		render();
	});

	signals.cameraResetted.add(updateAspectRatio);

	// animations

	var clock = new THREE.Clock(); // only used for animations

	this.animate = function () {
		requestAnimationFrame(_self.animate);
		var mixer = editor.mixer;
		var delta = clock.getDelta();

		var needsUpdate = false;

		if (mixer.stats.actions.inUse > 0) {
			mixer.update(delta);
			needsUpdate = true;
		}

		if (viewHelper.animating === true) {
			console.log("viewHelper.animating", viewHelper.animating);
			viewHelper.update(delta);
			needsUpdate = true;
		}
		console.log("needsUpdate", needsUpdate);
		if (needsUpdate === true) render();
	};
	requestAnimationFrame(_self.animate);

	//

	var startTime = 0;
	var endTime = 0;
	scene.add(grid);
	function render() {
		console.log("-------------render");
		startTime = performance.now();

		// Adding/removing grid to scene so materials with depthWrite false
		// don't render under the grid.
		// scene.add(grid);
		renderer.setViewport(0, 0, container.dom.offsetWidth, container.dom.offsetHeight);
		renderer.render(scene, editor.viewportCamera);

		if (labelRenderer) labelRenderer.render(scene, editor.viewportCamera);

		// scene.remove(grid);

		if (camera === editor.viewportCamera) {
			renderer.autoClear = false;
			if (showSceneHelpers === true) renderer.render(sceneHelpers, camera);
			viewHelper.render(renderer);
			renderer.autoClear = true;
		}

		endTime = performance.now();
		editor.signals.sceneRendered.dispatch(endTime - startTime);
	}
	this.controls = controls;
	return { container, render, prototype: this };
}

function updateGridColors(grid, colors) {
	// 改变网格颜色
	const color1 = new THREE.Color(colors[0]);
	const color2 = new THREE.Color(colors[1]);

	const attribute = grid.geometry.attributes.color;
	const array = attribute.array;

	for (var i = 0; i < array.length; i += 12) {
		const color = i % (12 * 5) === 0 ? color1 : color2;

		for (var j = 0; j < 12; j += 3) {
			color.toArray(array, i + j);
		}
	}

	attribute.needsUpdate = true;
}

export { Viewport, updateGridColors };
