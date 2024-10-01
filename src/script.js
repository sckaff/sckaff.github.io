        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0c0c0c); // Dark background

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight); 
        document.getElementById('scene-container').appendChild(renderer.domElement);

        let particleSystem; // Define particle system globally for reuse

        // Function to create the particle sphere based on window size
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

        camera.position.z = 10; 

        // Handle window resize events
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

            // Rotate the particle system
            if (particleSystem) {
                particleSystem.rotation.y += 0.001;
            }

            // Render the scene
            renderer.render(scene, camera);
        }

        animate(); // Start the animation