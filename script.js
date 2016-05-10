// find DOM objects
var earthContainer = document.querySelector("#earth-container");
var w = earthContainer.clientWidth, h = earthContainer.clientHeight;
var canvas = document.querySelector(".graph canvas.canv1");
var canvas2 = document.querySelector(".graph canvas.canv2");

// set up the 3D scene

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
renderer.shadowMap.enabled = true;
earthContainer.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(70,  w/h , 0.1, 1000);
camera.position.y = 5;
camera.position.z = 0.5;
camera.rotation.x = math.pi / 2;
camera.rotation.y = -math.pi;

var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(5, 5, 5);
light.castShadow = true;
scene.add(light);
// another more light source
light = new THREE.AmbientLight(0x606060); // soft white light
scene.add(light);

var geometry = new THREE.SphereGeometry(2.75, 64, 64);
var material = new THREE.MeshPhongMaterial();
var earthMesh = new THREE.Mesh(geometry, material);
earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
scene.add(earthMesh);
var loader = new THREE.TextureLoader();
loader.crossOrigin = '';
var textureUrl = "//raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/land_ocean_ice_cloud_2048.jpg";
loader.load(textureUrl, function (texture) {
	material.map = texture;
	material.needsUpdate = true;
});
var textureUrl = "//2.bp.blogspot.com/-oeguWUXEM8o/UkbyhLmUg-I/AAAAAAAAK-E/kSm3sH_f9fk/s1600/elev_bump_4k.jpg";
loader.load(textureUrl, function (texture) {
	material.bumpMap = texture;
	material.bumpScale = 0.05;
	material.needsUpdate = true;
});
var textureUrl = "//1.bp.blogspot.com/-596lbFumbyA/Ukb1cHw21_I/AAAAAAAAK-U/KArMZAjbvyU/s1600/water_4k.png";
loader.load(textureUrl, function (texture) {
	material.specularMap = texture;
	material.needsUpdate = true;
});

var cylinderMesh = new THREE.Mesh(
	new THREE.CylinderGeometry(0.01, 0.01, 0.2, 32),
	new THREE.MeshPhongMaterial({color: 0xffff00})
);
cylinderMesh.position.y = 2;
cylinderMesh.position.z = 2;
cylinderMesh.rotation.x = math.pi / 4;
cylinderMesh.castShadow = true;
cylinderMesh.receiveShadow = true;

var sphereMesh = new THREE.Mesh(
	new THREE.SphereGeometry(0.01, 0.01, 32),
	new THREE.MeshPhongMaterial({color: 0xff0000})
);
sphereMesh.castShadow = true;
sphereMesh.receiveShadow = true;
cylinderMesh.add(sphereMesh);

scene.add(cylinderMesh);


canvas.width = canvas.parentNode.clientWidth;
canvas.height = canvas.parentNode.clientHeight;
canvas2.width = canvas.parentNode.clientWidth;
canvas2.height = canvas.parentNode.clientHeight;
var ctx = canvas.getContext("2d");
var ctx2 = canvas2.getContext("2d");
ctx.lineWidth = 0.1;
ctx2.fillStyle = "#ff0000";
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx2.translate(canvas.width / 2, canvas.height / 2);

// We're too lazy to actually re-create everything by hands
// And -- I freaking hate JS object model with all of this 'this' stuff
window.addEventListener("resize", function () {
	document.location.reload();
});


// lattitude is a bit special
document.getElementById("lattitude").addEventListener("input", function () {
	earthMesh.rotation.x = -math.unit(this.value - 130, 'deg').toNumber('rad');
	// we should *not* keep the already drawn path
	clearPath();
});
// so here are the bindings,
// because we're too lazy to use Angular
var params = {};
["lattitude", "c1", "c2", "w_om"].forEach(function (v) {
	params[v] = 0;
	var el = document.getElementById(v);
	el.addEventListener("input", function () {
		params[v] = +this.value;
		this.closest("tr").querySelector("span").innerHTML = this.value;
	});
	el.dispatchEvent(new Event("input"));
});


function clearCanvas(context) {
	// this should be built-in, really
	// JavaScript, you are a horrible language
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.restore();
}

function render() {
	requestAnimationFrame(render);
	var t = Date.now() * 0.001;
	var p = calc(t, params.c1, params.c2, math.unit(params.lattitude, 'deg'),
		params.w_om * 0.03, 0.03);
	// no idea why this breaks everything
	// ctx.beginPath();
	ctx.lineTo(p.re, p.im);
	ctx.stroke();

	clearCanvas(ctx2);
	ctx2.beginPath();
	ctx2.arc(p.re, p.im, 5, 0, 2 * math.pi);
	ctx2.fill();

	sphereMesh.position.x = -p.re / 1000;
	sphereMesh.position.z = -p.im / 1000;
	renderer.render(scene, camera);
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

function clearPath() {
	clearCanvas(ctx);
	ctx.beginPath();
}
document.querySelector("button.clear").addEventListener("click", clearPath);
