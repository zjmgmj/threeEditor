import { CSS2DObject } from "../../../examples/jsm/renderers/CSS2DRenderer.js";
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
	const intersects = getIntersects({ point: onDownPosition, objects: scene.children, camera });
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

export default { screenToWorld, createLabel };
