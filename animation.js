// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Create particles geometry
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 10000;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radius = 5;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create material for particles
const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.01
});

// Create particle system
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

camera.position.z = 10;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the particle system
    particleSystem.rotation.y += 0.001;

    renderer.render(scene, camera);
}

animate();