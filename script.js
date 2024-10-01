// Set up the scene, camera, and renderer
const scene = new THREE.Scene(); // Create a new scene
scene.background = new THREE.Color(0x0c0c0c); // Set the background color of the scene to black
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); // Create a perspective camera with a 75-degree field of view
const renderer = new THREE.WebGLRenderer(); // Create a WebGL renderer
renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the renderer to match the window dimensions
document.getElementById('scene-container').appendChild(renderer.domElement); // Append the renderer's DOM element to the HTML element with ID 'scene-container'

// Create particles geometry
const particlesGeometry = new THREE.BufferGeometry(); // Create a buffer geometry for particles
const particleCount = 100000; // Define the number of particles
const positions = new Float32Array(particleCount * 3); // Create an array to store positions of all particles

// Calculate positions for each particle and store them in the positions array
for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2; // Random angle for spherical coordinates
    const phi = Math.acos((Math.random() * 2) - 1); // Random angle for spherical coordinates
    const radius = 5; // Fixed radius for sphere

    const x = radius * Math.sin(phi) * Math.cos(theta); // Calculate x position
    const y = radius * Math.sin(phi) * Math.sin(theta); // Calculate y position
    const z = radius * Math.cos(phi); // Calculate z position

    positions[i * 3] = x; // Assign x position to array
    positions[i * 3 + 1] = y; // Assign y position to array
    positions[i * 3 + 2] = z; // Assign z position to array
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); // Add positions as an attribute to the geometry

// Create material for particles
const particlesMaterial = new THREE.PointsMaterial({
    color: 0x333333, // Set color of particles to white
    size: 0.01       // Set size of each particle
});

// Create particle system and add it to the scene
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial); // Create a points object using geometry and material
scene.add(particleSystem); // Add the particle system to the scene

camera.position.z = 10; // Set camera's z-position to ensure visibility of particles

// Handle window resize events
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio
    camera.updateProjectionMatrix(); // Update camera projection matrix

    renderer.setSize(window.innerWidth, window.innerHeight); // Update renderer size to match new window dimensions
});

// Animation loop function
function animate() {
    requestAnimationFrame(animate); // Request the next frame

    particleSystem.rotation.y += 0.001; // Slightly rotate the particle system around the y-axis

    renderer.render(scene, camera); // Render the scene from the perspective of the camera
}

animate(); // Start the animation loop