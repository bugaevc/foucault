var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(5, 5, 5);
scene.add(light);

light = new THREE.AmbientLight(0x606060); // soft white light
scene.add(light);

var geometry = new THREE.SphereGeometry(2, 32, 32);

var earthMesh = null;
var textureUrl = "//raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/land_ocean_ice_cloud_2048.jpg";
var loader = new THREE.TextureLoader();
loader.crossOrigin = '';
loader.load(textureUrl, function (texture) {
	var material = new THREE.MeshPhongMaterial({ map: texture });
	earthMesh = new THREE.Mesh(geometry, material);
	scene.add(earthMesh);
});

camera.position.z = 5;

function render() {
	requestAnimationFrame(render);
	if (earthMesh != null)
		earthMesh.rotateX(0.001);
	renderer.render(scene, camera);
}
render();
