import * as THREE from 'three'
import {GUI} from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const gui = new GUI();
const parameters = {};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('.webgl');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const cube = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: 'red'});

parameters.wireframe = material.wireframe;

const mesh = new THREE.Mesh(cube, material);
gui.add(parameters, 'wireframe').onChange(()=>{mesh.material = new THREE.MeshBasicMaterial({color: 'red', wireframe: parameters.wireframe})});

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});

console.log(sizes)
renderer.setSize(sizes.width, sizes.height)

camera.position.y = 1;
camera.position.z = 3;

mesh.position.set(0,0,0);

scene.add(camera);
scene.add(mesh);

const tick = () => {

  controls.update();

  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}

tick();