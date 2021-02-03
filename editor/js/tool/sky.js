import * as THREE from "../../libs/three.module.js"; // 引用基本的three.js库
import { loadModel } from "./load.js";
function SkyBox(editor) {
	this.editor = editor;
}
SkyBox.prototype = {
	show({ urls, size = 8000 }) {
		const _self = this;
		const path = "/editor/images/sky/";
		const list = urls || [
			path + "negx.jpg", // 前
			path + "posx.jpg", // 后
			path + "posy.jpg", // 上
			path + "negy.jpg", // 下
			path + "negz.jpg",
			path + "posz.jpg",
		];
		// loadModel({ path: "/editor/images/sky/3D.gltf" })
		// 	.then((res) => {
		// 		const model = res.scenes[0];
		// 		model.name = "天空盒土地";
		// 		model.position.y = 15;
		// 		_self.editor.addObject(model);
		// 	})
		// 	.catch((err) => {
		// 		console.error("error-->>", err);
		// 	});
		this.editor.scene.background = this.makeSkybox(list, size);
	},
	makeSkybox(urls, size) {
		var skyboxCubemap = new THREE.CubeTextureLoader().load(urls);
		skyboxCubemap.format = THREE.RGBFormat;

		return skyboxCubemap;
	},
};
export default SkyBox;
