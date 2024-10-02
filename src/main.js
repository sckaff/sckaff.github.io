import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
scene.background = new THREE.Color(0x0c0c0c);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(50, 0, 50).normalize();
scene.add(directionalLight);

let particleSystem;
let textMesh;
let font;

// Function to calculate the appropriate radius based on window size
function calculateRadius() {
  return Math.min(window.innerWidth, window.innerHeight) / 65;
}

// Function to calculate the particle count based on window size
function calculateParticleCount() {
  const baseCount = 100000; // Base particle count
  const scaleFactor = (window.innerWidth * window.innerHeight) / (1920 * 1080); // Scale factor based on 1080p resolution
  return Math.floor(baseCount * scaleFactor);
}

// Function to create particle sphere
function createParticleSphere(radius) {
  if (particleSystem) scene.remove(particleSystem);

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = calculateParticleCount();
  const positions = new Float32Array(particleCount * 3); // x, y, z for each particle

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta) / 3;
    const y = radius * Math.sin(phi) * Math.sin(theta) / 3;
    const z = radius * Math.cos(phi) / 3;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    transparent: false,
    color: 0x444444,
    size: 0.02,
  });

  particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);
}

// Initial setup
const initialRadius = calculateRadius();
createParticleSphere(initialRadius);

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  const newRadius = calculateRadius();
  createParticleSphere(newRadius);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (particleSystem) {
    particleSystem.rotation.y += 0.001;
  }

  if (textMesh) {
    textMesh.rotation.y -= 0.0125;
  }

  renderer.render(scene, camera);
}

animate();
