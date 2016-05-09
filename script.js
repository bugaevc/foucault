// find DOM objects
var earthContainer = document.querySelector("#earth-container");
var w = earthContainer.clientWidth, h = earthContainer.clientHeight;
var canvas = document.querySelector(".graph canvas");
var lattitudeEl = document.querySelector("#lattitude");
var c1El = document.querySelector("#c1");
var c2El = document.querySelector("#c2");

// set up the 3D scene

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
renderer.shadowMap.enabled = true;
earthContainer.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(75,  w/h , 0.1, 1000);
camera.position.y = 5;
camera.rotation.x = math.pi / 2;
camera.rotation.y = -math.pi;
// camera.up = new THREE.Vector3(0, 0, 1); // Z is the up direction

var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(5, 5, 5);
light.castShadow = true;
scene.add(light);
// another more light source
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
	earthMesh.receiveShadow = true;
	scene.add(earthMesh);
	lattitudeEl.dispatchEvent(new Event('input'));
});

var cylinderMesh = new THREE.Mesh(
	new THREE.CylinderGeometry(0.05, 0.05, 0.2, 32),
	new THREE.MeshPhongMaterial({color: 0xffff00})
);
cylinderMesh.position.y = 2;
cylinderMesh.position.z = 2;
cylinderMesh.rotation.x = math.pi / 4;
cylinderMesh.castShadow = true;
scene.add(cylinderMesh);


var ctx;
function setUpCanvas() {
	canvas.width = canvas.parentNode.clientWidth;
	canvas.height = canvas.parentNode.clientHeight;
	ctx = canvas.getContext("2d");
	ctx.lineWidth = 0.05;
	ctx.translate(canvas.width / 2, canvas.height / 2);
}
setUpCanvas();
window.addEventListener("resize", setUpCanvas);


// set up the simulation data
var t = 0.0;
// so here are the bindings,
// because we're too lazy to use Angular
var lattitude;
lattitudeEl.addEventListener("input", function () {
	lattitude = +this.value;
	this.closest("tr").querySelector("span").innerHTML = lattitude;
	if (earthMesh != null)
		earthMesh.rotation.x = -math.unit(lattitude - 120, 'deg').toNumber('rad');
});
lattitudeEl.dispatchEvent(new Event('input'));

var c1;
c1El.addEventListener("input", function () {
	c1 = +this.value;
	this.closest("tr").querySelector("span").innerHTML = c1;
});
c1El.dispatchEvent(new Event('input'));
var c2;
c2El.addEventListener("input", function () {
	c2 = +this.value;
	this.closest("tr").querySelector("span").innerHTML = c2;
});
c2El.dispatchEvent(new Event('input'));

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	var p = calc(t, c1, c2, math.unit(lattitude, 'deg'), 10, 0.1);
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
