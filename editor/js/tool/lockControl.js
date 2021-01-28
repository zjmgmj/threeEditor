import * as THREE from "../../libs/three.module.js";
import { PointerLockControls } from "../../libs/jsm/controls/PointerLockControls.js";
// import Base from "./base.js";
function LockControls(editor, viewport) {
	// -------------------
	// const _self = this;
	this.editor = editor;
	this.viewport = viewport;
	return this;
}

LockControls.prototype.start = function ({ trajector = [], speed = 0.5 }) {
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

	var controlSpeed = 60; //控制器移动速度
	var upSpeed = 100; //控制跳起时的速度
	var clock = new THREE.Clock(); // only used for animations
	let mixer = null;
	function initPointerLock() {
		//实现鼠标锁定的教程地址 http://www.html5rocks.com/en/tutorials/pointerlock/intro/
		// !trajector.length
		pointerLockControls.enabled = true;
		console.log("--------------lock");
		dom.requestPointerLock = dom.requestPointerLock || dom.mozRequestPointerLock || dom.webkitRequestPointerLock;
		dom.requestPointerLock();
		controlsEnabled = !trajector.length;
		pointerLockControls.addEventListener("unlock", unlock);
	}
	function onKeyDown(event) {
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
				debugger;
				if (!trajector.length) {
					if (canJump && spaceUp) velocity.y += upSpeed;
					canJump = false;
					spaceUp = false;
				} else {
					console.log("----------------paused");
					mixer.paused = !mixer.paused;
				}
				break;
		}
	}
	function onKeyUp(event) {
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
	}
	function initControls() {
		pointerLockControls = new PointerLockControls(editor.camera, dom);
		if (!trajector.length) {
			// pointerLockControls = viewport.prototype.controls
			pointerLockControls.getObject().position.y = 0;
			pointerLockControls.getObject().position.x = 0;
			pointerLockControls.getObject().position.z = 10;
			scene.add(pointerLockControls.getObject());
			document.addEventListener("keydown", onKeyDown, false);
			document.addEventListener("keyup", onKeyUp, false);
		} else {
			pointerLockControls.getObject().position.copy(trajector[0]);
			scene.add(pointerLockControls.getObject());
			console.log("----------------------------------自动移动", trajector);
			// 自动移动
			// const testBox = Base.createBox({ size: { x: 10, y: 10, z: 10 } });
			// testBox.name = "testBox";
			// testBox.position.copy(trajector[0]);
			// scene.add(testBox);
			let endTime = 0;
			const times = [0];
			const positions = [...trajector[0].toArray()];
			for (let i = 1; i < trajector.length; i++) {
				const point = trajector[i];
				const prevPoint = trajector[i - 1];
				const length = prevPoint.distanceTo(point);
				endTime += length * speed;
				times.push(endTime);
				positions.push(...point.toArray());
			}
			// 创建关键帧轨道
			const track = new THREE.KeyframeTrack(
				"Camera.position", // 指定对象中的变形目标为Y轴旋转属性
				times, // 关键帧的时间数组
				Float32Array.from(positions) // 与时间数组中的时间点相关的值组成的数组
			);
			const duration = times[times.length - 1];
			const clip = new THREE.AnimationClip(
				"Camera", // 此剪辑的名称
				duration, // 如果传入负数，持续时间将会从传入的数组中计算得到
				[track] // 一个由关键帧轨道（KeyframeTracks）组成的数组。
			);
			clip.clampWhenFinished = true;
			mixer = editor.mixer.clipAction(clip);
			mixer.clampWhenFinished = true;
			mixer.loop = THREE.LoopOnce;
			mixer.play();
			document.addEventListener("keydown", onKeyDown, false);
		}
	}
	function renderControl() {
		const minCameraY = 1;
		if (controlsEnabled) {
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
			if (moveForward || moveBackward) velocity.z -= direction.z * controlSpeed * delta;
			if (moveLeft || moveRight) velocity.x -= direction.x * controlSpeed * delta;

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
		if (controlsEnabled) viewport.prototype.animate = animate;
		if (mixer) {
			mixer.stop();
			editor.mixer._removeInactiveAction(mixer);
			mixer = null;
		}
		viewport.prototype.controls = controls;
		document.removeEventListener("keydown", onKeyDown, false);
		document.removeEventListener("keyup", onKeyUp, false);
		pointerLockControls.removeEventListener("unlock", unlock);
		setTimeout(() => {
			_self.unlockAfter();
		}, 2000);
	}
	initControls();
	initPointerLock();
	viewport.prototype.controls = pointerLockControls;
	controlsEnabled
		? (viewport.prototype.animate = () => {
				requestAnimationFrame(viewport.prototype.animate);
				renderControl();
				render();
		  })
		: viewport.render();

	return this;
};

LockControls.prototype.unlockAfter = function () {};

export default LockControls;
