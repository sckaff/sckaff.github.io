import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// Adjust camera position to better see the tilt
camera.position.set(2, 5, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({alpha: true});
scene.background = null;
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('sphere').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(50, 0, 50).normalize();
scene.add(directionalLight);

let particleSystem;

const TILT = 23.5 * (Math.PI / 180);

function calculateRadius() {
    return Math.min(window.innerWidth, window.innerHeight) / 75;
}

function createStructuredSphere(radius) {
    if (particleSystem) scene.remove(particleSystem);

    const particlesGeometry = new THREE.BufferGeometry();
    const positions = [];

    const latitudeLines = 20;
    const longitudeLines = 20;
    const pointsPerLine = 1000;

    // Create latitude lines (horizontal)
    for (let lat = 0; lat < latitudeLines; lat++) {
        const phi = (Math.PI * lat) / latitudeLines;
        for (let i = 0; i <= pointsPerLine; i++) {
            const theta = (2 * Math.PI * i) / pointsPerLine;
            const x = radius * Math.sin(phi) * Math.cos(theta) / 3;
            const y = radius * Math.sin(phi) * Math.sin(theta) / 3;
            const z = radius * Math.cos(phi) / 3;
            positions.push(x, y, z);
        }
    }

    // Create longitude lines (vertical)
    for (let long = 0; long < longitudeLines; long++) {
        const theta = (2 * Math.PI * long) / longitudeLines;
        for (let i = 0; i <= pointsPerLine; i++) {
            const phi = (Math.PI * i) / pointsPerLine;
            const x = radius * Math.sin(phi) * Math.cos(theta) / 3;
            const y = radius * Math.sin(phi) * Math.sin(theta) / 3;
            const z = radius * Math.cos(phi) / 3;
            positions.push(x, y, z);
        }
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffae00,
        size: 0.02,
        transparent: false
    });

    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    
    // Apply Earth's axial tilt
    particleSystem.rotation.x = TILT;
    
    scene.add(particleSystem);
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

// Animation loop with Earth-like rotation
function animate() {
    requestAnimationFrame(animate);

    if (particleSystem) {
        // Rotate around the tilted axis
        particleSystem.rotation.y -= 0.002; // Adjust speed as needed
    }

    renderer.render(scene, camera);
}

animate();