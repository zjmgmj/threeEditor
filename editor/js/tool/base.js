import { CSS2DObject } from "../../../examples/jsm/renderers/CSS2DRenderer.js";
import * as THREE from "../../../../build/three.module.js"; // 引用基本的three.js库
function getMousePosition(dom, x, y) {
	// 获取鼠标在场景中坐标
	var rect = dom.getBoundingClientRect();
	return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
}
function getIntersects({ point, objects, camera }) {
	// 获取鼠标选择中的模型
	const mouse = new THREE.Vector2();
	mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);

	return raycaster.intersectObjects(objects);
}
/**
 *
 * @param {*} dom
 * @param {*} x 鼠标当前位置e.clientX
 * @param {*} y 鼠标当前位置e.clientY
 * @param {*} camera
 * @param {*} targetY Z轴坐标
 */
function screenToWorld({ dom, x, z, editor, targetY = 0 }) {
	// 获取鼠标在场景中坐标
	const { camera, scene } = editor;
	var pos = new THREE.Vector3();
	var vec = new THREE.Vector3();
	const onDownPosition = new THREE.Vector2();
	const array = getMousePosition(dom, x, z);
	onDownPosition.fromArray(array);
	const objects = getSceneObjects(scene.children);
	console.log("-----------objects", objects);
	const intersects = getIntersects({ point: onDownPosition, objects, camera });
	if (intersects.length > 0) {
		pos.copy(intersects[0].point);
	} else {
		vec.set((x / dom.clientWidth) * 2 - 1, -(z / dom.clientHeight) * 2 + 1.06, 0.5);
		vec.unproject(camera);
		vec.sub(camera.position).normalize();
		var distance = (targetY - camera.position.y) / vec.y;
		pos.copy(camera.position).add(vec.multiplyScalar(distance));
	}
	return pos;
}
/**
 * createLabel 标注
 * @param {string} content 内容
 * @param {string} className
 * @param {Object} scene
 * @param {Vector3} position
 */
function createLabel({ content, className, editor, position, dom, parent, name }) {
	if (!dom) {
		dom = document.createElement("div");
		dom.className = className;
		dom.textContent = content;
	}
	const label = new CSS2DObject(dom);
	position ? label.position.copy(position) : label.position.set(0, 0, 0);
	// scene.add(label);
	label.name = name;
	editor.addObject(label, parent);
	// scene.dispose();
}

function removeLabel({ name, parent }) {
	const model = parent.getObjectByName(name);
	if (model) editor.removeObject(model);
}

function getSceneObjects(group) {
	// const sceneModels = scene.children
	const objects = [];
	// const models = group;
	for (let i = 0; i < group.length; i++) {
		if (group[i].constructor.name === "Mesh") {
			objects.push(group[i]);
		} else {
			objects.push(...getSceneObjects(group[i].children));
		}
	}
	return objects;
}

function getRay({ startPoint, endPoint, model }) {
	// 注意执行.clone()返回一个新的向量，以免改变几何体顶点坐标值
	// 几何体的顶点坐标要执行该几何体绑定模型对象经过的旋转平移缩放变换
	// 几何体顶点经过的变换可以通过模型的本地矩阵属性.matrix或世界矩阵属性.matrixWorld获得
	const worldCoord = endPoint.clone().applyMatrix4(model.matrixWorld);
	// 可以通过position属性或.getWorldPosition()方法获得模型几何中心的世界坐标
	// var centerCoord = model.position.clone();
	const startCoord = startPoint.clone();
	var dir = new THREE.Vector3(); //创建一个向量
	// 几何体顶点坐标和几何体中心坐标构成的方向向量
	dir.subVectors(startCoord, worldCoord);
	const raycaster = new THREE.Raycaster(startCoord, dir.clone().normalize());
	const intersects = raycaster.intersectObjects([model]);
	return intersects;
}

export default { screenToWorld, createLabel, getRay, removeLabel };
