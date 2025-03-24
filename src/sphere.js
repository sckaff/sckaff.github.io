import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 5, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('sphere').appendChild(renderer.domElement);

scene.background = null;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(50, 0, 50).normalize();
scene.add(directionalLight);

let particleSystem;

const TILT = 23.5 * (Math.PI / 180);

// Helper function to calculate radius based on screen size
function calculateRadius() {
    return Math.min(window.innerWidth, window.innerHeight) / (window.innerWidth < 500 ? 32 : 60);
}

// Helper function to calculate points per line based on resolution
function calculatePointsPerLine() {
    const baseCount = 2500;
    const scaleFactor = (window.innerWidth * window.innerHeight) / (1920 * 1080);
    return Math.floor(baseCount * scaleFactor);
}

// Helper function to create a structured sphere
function createStructuredSphere(radius) {
    if (particleSystem) scene.remove(particleSystem);

    const particlesGeometry = new THREE.BufferGeometry();
    const positions = [];

    const latitudeLines = 20;
    const longitudeLines = 20;
    const pointsPerLine = calculatePointsPerLine();

    // Create latitude lines
    for (let lat = 0; lat < latitudeLines; lat++) {
        const phi = (Math.PI * lat) / latitudeLines;
        for (let i = 0; i <= pointsPerLine; i++) {
            const theta = (2 * Math.PI * i) / pointsPerLine;
            addPoint(positions, radius, phi, theta, 1 / 3);
        }
    }

    // Create longitude lines
    for (let long = 0; long < longitudeLines; long++) {
        const theta = (2 * Math.PI * long) / longitudeLines;
        for (let i = 0; i <= pointsPerLine; i++) {
            const phi = (Math.PI * i) / pointsPerLine;
            addPoint(positions, radius, phi, theta, 1 / 3);
        }
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffae00,
        size: 0.02,
        transparent: false
    });

    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    particleSystem.rotation.x = TILT;
    scene.add(particleSystem);
}

// Helper function to add a point with given parameters
function addPoint(positions, radius, phi, theta, scale) {
    const x = radius * Math.sin(phi) * Math.cos(theta) * scale;
    const y = radius * Math.sin(phi) * Math.sin(theta) * scale;
    const z = radius * Math.cos(phi) * scale;
    positions.push(x, y, z);
}

// Initial setup
const initialRadius = calculateRadius();
createStructuredSphere(initialRadius);

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const newRadius = calculateRadius();
    createStructuredSphere(newRadius);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (particleSystem) {
        particleSystem.rotation.y -= 0.002;
    }

    renderer.render(scene, camera);
}

animate();