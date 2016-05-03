// find DOM objects
var earthContainer = document.querySelector("#earth-container");
var w = earthContainer.clientWidth, h = earthContainer.clientHeight;
var canvas = document.querySelector(".graph canvas");

// set up the 3D scene

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75,  w/h , 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
earthContainer.appendChild(renderer.domElement);

var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(5, 5, 5);
scene.add(light);

light = new THREE.AmbientLight(0x606060); // soft white light
scene.add(light);

var geometry = new THREE.SphereGeometry(2.75, 64, 64);

// load the Earth texture

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

// set up the canvas
canvas.width = canvas.parentNode.clientWidth;
canvas.height = canvas.parentNode.clientHeight;
var ctx = canvas.getContext("2d");

ctx.translate(500, 250);
ctx.lineWidth = 0.1;

// set up the simulation data
var t = 0.0;
var lattitude = document.querySelector("#lattitude").value;
document.querySelector("#lattitude").addEventListener("input", function () {
	lattitude = this.value;
	if (earthMesh != null)
		earthMesh.rotation.x = math.unit(lattitude - 90, 'deg').toNumber('rad');
});

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	var p = calc(t, 200, 200, math.unit(lattitude, 'deg'), 10, 0.1);
	ctx.strokeStyle = timeToColor(Math.ceil(t));
	ctx.lineTo(p.re, p.im);
	ctx.stroke();
	t += 0.01;
}
render();

function calc(t, c1, c2, phi, w, om) {
	// https://www.wikiwand.com/en/Foucault_pendulum#/Precession_as_a_form_of_parallel_transport
	// at the end of the section
	var k = math.chain(math.i)
		.multiply(-om)
		.multiply(math.sin(phi))
		.multiply(t)
		.exp()
		.done();
	function f(c, w) {
		return math.chain(math.i)
			.multiply(w)
			.multiply(t)
			.exp()
			.multiply(c)
			.done();
	}
	return math.multiply(k,
		math.add(f(c1, w), f(c2, -w))
	);
}

function timeToColor(t) {
	return "rgb(" + t*10 + ", 0, 0)";
}
