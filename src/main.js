import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(5, 3, 10); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
scene.background = new THREE.Color(0x0c0c0c);
renderer.setSize(window.innerWidth, window.innerHeight); 

document.getElementById('scene-container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Increase intensity of directional light
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

let particleSystem;
let textMesh;

// ---------- Sphere ----------
function createParticleSphere(radius) {
    // If particle system already exists, remove it before creating a new one
    if (particleSystem) scene.remove(particleSystem);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100000;
    const positions = new Float32Array(particleCount * 3); // x, y, z for each particle

    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2; // Random angle theta
        const phi = Math.acos((Math.random() * 2) - 1); // Random angle phi

        const x = radius * Math.sin(phi) * Math.cos(theta) / 3; 
        const y = radius * Math.sin(phi) * Math.sin(theta) / 3; 
        const z = radius * Math.cos(phi) / 3;

        positions[i * 3] = x; 
        positions[i * 3 + 1] = y; 
        positions[i * 3 + 2] = z; 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        transparent: true,
        opacity: 1,
        color: 0x444444,
        size: 0.02 
    });

    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
}

// Initial particle system
const initialRadius = Math.min(window.innerWidth, window.innerHeight) / 100; // Radius based on window size
createParticleSphere(initialRadius);

// ---------- Text Geometry ----------
const loader = new FontLoader();

loader.load('s_ness_serif_8x8_regular.json', function (font) {
  const geometry = new TextGeometry('n construction      i', {
    font: font,
    size: 115,
    height: 5, 
    curveSegments: 12,
    bevelEnabled: true,
    bevelSize: 5,
});

  // Create a MeshStandardMaterial with a metallic and roughness effect
  const material = new THREE.MeshStandardMaterial({
    color: 0xffce1f, // Base color
    metalness: 0.5,  // How metallic the material is
    roughness: 0.4,  // How rough or smooth the surface is
  });

  textMesh = new THREE.Mesh(geometry, material);

  // Center the text geometry so it rotates correctly around the circular path
  geometry.computeBoundingBox();
  const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
  textMesh.position.x = centerOffset;
  textMesh.scale.x = -1;
  
  textMesh.scale.set(0.0058, 0.0058, 0.0058);  // Scale down the text to match the size of the particle system
  textMesh.position.set(0, 0, 0);  // Move the text above the particle system
  
  // Bend the text around a circular path
  const radius = 500;  // Radius of the circle for the curved text
  const positionAttribute = geometry.attributes.position;

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);

    // Calculate the angle for each vertex along the circular path
    const angle = (x / (geometry.boundingBox.max.x - geometry.boundingBox.min.x)) * Math.PI * 2 + Math.PI;
    const newX = Math.cos(angle) * radius;
    const newZ = Math.sin(angle) * radius;

    // Set the new position of each vertex
    positionAttribute.setXYZ(i, newX, y, newZ);
  }

  positionAttribute.needsUpdate = true;

  // Add the text mesh to the scene
  scene.add(textMesh);
});

// -------- Window Resize Events --------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Update aspect ratio
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight); // Adjust renderer size

    const newRadius = Math.min(window.innerWidth, window.innerHeight) / 100; // Adjust radius based on window size
    createParticleSphere(newRadius); // Recreate particle sphere with new radius
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (particleSystem) {
        particleSystem.rotation.y += 0.001;
    }

    if (textMesh) {
        textMesh.rotation.y -= 0.0125; // Rotate the text for a dynamic effect
    }

    // Render the scene
    renderer.render(scene, camera);
}

animate();