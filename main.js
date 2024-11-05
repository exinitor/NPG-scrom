import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// increase count of button click
function incVal()
{
    LMSSetValue("cmi.objectives._count",LMSGetValue("cmi.objectives._count") + 1 );
};

// a cylinder to be used as a button
class Cylinder extends THREE.Mesh {
    constructor() {
      super()
      this.geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 32);
      this.material = new THREE.MeshStandardMaterial({ color: new THREE.Color('yellow') });
      this.clicked = false;
    };
  
    // on mouse hover event
    onPointerOver(e) {
      this.material.color.set('green');
    };
  
    // on mouse "removed from object" event
    onPointerOut(e) {
      this.material.color.set('yellow');
    };
  
    // on mouse hover and clicked event
    onClick(e) {
        let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
        width=600,height=300,left=100,top=100`;
        open('/popup', 'test', params);
        incVal();
        LMSCommit();
        LMSFinish();
    };
  };



/////////////////////setup///////////////////////////

// canvas
const canvas = document.querySelector('canvas.webgl');

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );
//lights
const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let intersects = []
let hovered = {}


/////////////////////objects////////////////////////////////
//box
const box = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({color: 'red'});
const cube = new THREE.Mesh(box,material);
//button
const cylinder = new Cylinder(); 
cylinder.position.set( 0.5, 0, 0 );
cylinder.rotateZ(Math.PI / 2);
const group = new THREE.Group(); 
group.add( cylinder );
group.add( cube );
scene.add(group);

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 3;
scene.add(camera);

//renderer, set it to render inside the canvas
const renderer = new THREE.WebGLRenderer({
canvas: canvas
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

function animate() {
    controls.update();
    renderer.render( scene, camera ); 
    };
renderer.setAnimationLoop( animate );

//update window when resized
window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};


///////////////////////// events //////////////////////////
window.addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);

    // If a previously hovered item is not among the hits we must call onPointerOut
  Object.keys(hovered).forEach((key) => {
    const hit = intersects.find((hit) => hit.object.uuid === key);
    if (hit === undefined) {
      const hoveredItem = hovered[key];
      if (hoveredItem.object.onPointerOver) hoveredItem.object.onPointerOut(hoveredItem)
      delete hovered[key];
    };
  });

  intersects.forEach((hit) => {
    // If a hit has not been flagged as hovered we must call onPointerOver
    if (!hovered[hit.object.uuid]) {
      hovered[hit.object.uuid] = hit;
      if (hit.object.onPointerOver) hit.object.onPointerOver(hit);
    };
    // Call onPointerMove
    if (hit.object.onPointerMove) hit.object.onPointerMove(hit);
  });
});

// event for clicking on button
window.addEventListener('click', (e) => {
    intersects.forEach((hit) => {
      // Call onClick
      if (hit.object.onClick) hit.object.onClick(hit)
    })
  })