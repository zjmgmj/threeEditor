import * as THREE from "../../libs/three.module.js"; // 引用基本的three.js库
import { OBJLoader } from "../../libs/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "../../libs/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "../../libs/jsm/loaders/GLTFLoader.js";
// import { ZipLoader } from "../libs/three-ziploader/src/ZipLoader.js"; // 需在包中手动引入three
function loadZip(path) {
	// const manager = new THREE.LoadingManager();
	// return new Promise((resolve) => {
	// 	new ZipLoader().load(path).then((zip) => {
	// 		manager.setURLModifier(zip.urlResolver);
	// 		const file = zip.find(/\.(gltf|glb)$/i)[0];
	// 		new GLTFLoader(manager).load(file, (model) => {
	// 			resolve(model);
	// 		});
	// 	});
	// });
}

function loadModel({ format = "gltf", path }) {
	// 模型加载
	let loader = null;
	switch (format) {
		case "obj":
			loader = new OBJLoader();
			break;
		case "fbx":
			loader = new FBXLoader();
			break;
		case "gltf":
			loader = new GLTFLoader();
			break;
		default:
			console.log("----");
			break;
	}
	return new Promise((resolve, reject) => {
		loader.load(
			path,
			function (res) {
				console.log(path, res);
				resolve(res);
			},
			function (progress) {
				console.log("progress", progress);
			}, // onProgress
			function (error) {
				// err
				reject(error);
			}
		);
	});
}

function $get(url) {
	return new Promise((resolve) => {
		$.get(url, function (res) {
			resolve(res);
		});
	});
}

export { loadZip, loadModel, $get };
