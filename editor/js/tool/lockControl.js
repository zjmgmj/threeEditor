import * as THREE from "../../libs/three.module.js";
import { PointerLockControls } from "../../libs/jsm/controls/PointerLockControls.js";
function LockControls(editor, viewport) {
	// -------------------
	// const _self = this;
	this.editor = editor;
	this.viewport = viewport;
	return this;
}

LockControls.prototype.start = function () {
	const { viewport, editor } = this;
	const _self = this;
	let { container, render } = viewport;
	const scene = editor.scene;
	const dom = container.dom;
	const animate = viewport.prototype.animate;
	const controls = viewport.prototype.controls;
	let pointerLockControls;
	_self.control = null;
	var controlsEnabled = false;
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var canJump = false;
	var spaceUp = true; //处理一直按着空格连续跳的问题
	//声明射线
	var horizontalRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10);
	var downRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

	var velocity = new THREE.Vector3(); //移动速度变量
	var direction = new THREE.Vector3(); //移动的方向变量
	var rotation = new THREE.Vector3(); //当前的相机朝向

	var speed = 60; //控制器移动速度
	var upSpeed = 100; //控制跳起时的速度
	var clock = new THREE.Clock(); // only used for animations
	function initPointerLock() {
		//实现鼠标锁定的教程地址 http://www.html5rocks.com/en/tutorials/pointerlock/intro/
		pointerLockControls.enabled = true;
		dom.requestPointerLock = dom.requestPointerLock || dom.mozRequestPointerLock || dom.webkitRequestPointerLock;
		dom.requestPointerLock();
		controlsEnabled = true;
		pointerLockControls.addEventListener("unlock", unlock);
	}
	initControls();
	initPointerLock();
	viewport.prototype.controls = pointerLockControls;
	viewport.prototype.animate = () => {
		requestAnimationFrame(viewport.prototype.animate);
		renderControl();
		render();
	};
	function initControls() {
		pointerLockControls = new PointerLockControls(editor.camera, dom);
		// pointerLockControls = viewport.prototype.controls
		pointerLockControls.getObject().position.y = 0;
		pointerLockControls.getObject().position.x = 0;
		scene.add(pointerLockControls.getObject());
		var onKeyDown = function (event) {
			switch (event.keyCode) {
				case 38: // up
				case 87: // w
					moveForward = true;
					break;
				case 37: // left
				case 65: // a
					moveLeft = true;
					break;
				case 40: // down
				case 83: // s
					moveBackward = true;
					break;
				case 39: // right
				case 68: // d
					moveRight = true;
					break;
				case 32: // space
					if (canJump && spaceUp) velocity.y += upSpeed;
					canJump = false;
					spaceUp = false;
					break;
			}
		};
		var onKeyUp = function (event) {
			switch (event.keyCode) {
				case 38: // up
				case 87: // w
					moveForward = false;
					break;
				case 37: // left
				case 65: // a
					moveLeft = false;
					break;
				case 40: // down
				case 83: // s
					moveBackward = false;
					break;
				case 39: // right
				case 68: // d
					moveRight = false;
					break;
				case 32: // space
					spaceUp = true;
					break;
				default:
					console.log("取消");
					break;
			}
		};
		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);
	}
	function renderControl() {
		const minCameraY = 1;
		if (controlsEnabled === true) {
			//获取到控制器对象
			var control = pointerLockControls.getObject();
			//获取刷新时间
			var delta = clock.getDelta();

			//velocity每次的速度，为了保证有过渡
			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			velocity.y -= 9.8 * 100.0 * delta; // 默认下降的速度

			//获取当前按键的方向并获取朝哪个方向移动
			direction.z = Number(moveForward) - Number(moveBackward);
			direction.x = Number(moveLeft) - Number(moveRight);
			//将法向量的值归一化
			direction.normalize();

			//判断是否接触到了模型
			rotation.copy(control.getWorldDirection().multiply(new THREE.Vector3(-1, 0, -1)));

			//判断鼠标按下的方向
			var m = new THREE.Matrix4();
			if (direction.z > 0) {
				if (direction.x > 0) {
					m.makeRotationY(Math.PI / 4);
				} else if (direction.x < 0) {
					m.makeRotationY(-Math.PI / 4);
				} else {
					m.makeRotationY(0);
				}
			} else if (direction.z < 0) {
				if (direction.x > 0) {
					m.makeRotationY((Math.PI / 4) * 3);
				} else if (direction.x < 0) {
					m.makeRotationY((-Math.PI / 4) * 3);
				} else {
					m.makeRotationY(Math.PI);
				}
			} else {
				if (direction.x > 0) {
					m.makeRotationY(Math.PI / 2);
				} else if (direction.x < 0) {
					m.makeRotationY(-Math.PI / 2);
				}
			}
			//给向量使用变换矩阵
			rotation.applyMatrix4(m);
			//horizontal.setDirection(rotation);
			horizontalRaycaster.set(control.position, rotation);

			// var horizontalIntersections = horizontalRaycaster.intersectObjects(editor.scene.children, true);
			// var horOnObject = horizontalIntersections.length > 0;

			//判断移动方向修改速度方向
			// if (!horOnObject) { // 判断碰撞
			// 	if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
			// 	if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
			// }
			if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
			if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

			//复制相机的位置
			downRaycaster.ray.origin.copy(control.position);
			//获取相机靠下minCameraY的位置
			downRaycaster.ray.origin.y -= minCameraY;
			//判断是否停留在了立方体上面
			var intersections = downRaycaster.intersectObjects(editor.scene.children, true);
			var onObject = intersections.length > 0;
			//判断是否停在了立方体上面
			if (onObject === true) {
				velocity.y = Math.max(0, velocity.y);
				canJump = true;
			}
			//根据速度值移动控制器
			control.translateX(velocity.x * delta);
			control.translateY(velocity.y * delta);
			control.translateZ(velocity.z * delta);

			//保证控制器的y轴在minCameraY以上
			if (control.position.y < 1) {
				velocity.y = 0;
				control.position.y = 1;
				canJump = true;
			}
		}
	}
	function unlock() {
		viewport.prototype.animate = animate;
		viewport.prototype.controls = controls;
		pointerLockControls.removeEventListener("unlock", unlock);
		_self.unlockAfter();
	}
	return this;
};

LockControls.prototype.unlockAfter = function () {};

export default LockControls;
