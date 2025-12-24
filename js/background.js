/**
 * Stonedrum Background Animation
 * Effect: Neural Network / Constellation
 * Tech: Three.js
 * 
 * Features:
 * - Smaller, round particles with variant colors
 * - More visible connection lines
 * - Mouse parallax interaction
 */

const initBackground = () => {
    // 1. Setup Scene
    const scene = new THREE.Scene();
    // Dark background color matching design spec
    scene.background = new THREE.Color(0x050505);
    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.0015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // Limit pixel ratio on high-DPI screens for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach to DOM
    const container = document.getElementById('canvas-container');
    if (container) {
        container.appendChild(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-1';
    }

    // 2. Create Particles with variant colors
    const particleCount = window.innerWidth < 768 ? 80 : 120;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    // Color palette - similar theme (cyans, teals, light blues, soft purples)
    const colorPalette = [
        new THREE.Color(0x00F0FF), // Cyan
        new THREE.Color(0x00D4E8), // Teal Cyan
        new THREE.Color(0x40E0D0), // Turquoise
        new THREE.Color(0x7DF9FF), // Electric Blue
        new THREE.Color(0xA0D8EF), // Light Sky Blue
        new THREE.Color(0xB8A9C9), // Soft Lavender
        new THREE.Color(0x9B59B6), // Amethyst Purple
    ];

    // Spread particles randomly in a 3D box
    const r = 150;
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        // Assign random color from palette
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        particleColors[i * 3] = color.r;
        particleColors[i * 3 + 1] = color.g;
        particleColors[i * 3 + 2] = color.b;

        // Random movement velocity
        particleVelocities.push({
            x: (Math.random() - 0.5) * 0.08,
            y: (Math.random() - 0.5) * 0.08,
            z: (Math.random() - 0.5) * 0.08
        });
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Create a circular/round particle texture
    const createCircleTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Create radial gradient for soft round particles
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    };

    // Particle Material - smaller, round particles with vertex colors
    const particlesMaterial = new THREE.PointsMaterial({
        size: 1.2, // Slightly larger for better visibility
        map: createCircleTexture(),
        transparent: true,
        opacity: 0.9,
        vertexColors: true, // Use per-particle colors
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particles, particlesMaterial);
    scene.add(particleSystem);

    // 3. Create Lines (The Connections) - More visible
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 3);
    const lineColors = new Float32Array(particleCount * particleCount * 3);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    // Line Material - Brighter, more visible
    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4, // Increased opacity for visibility
        blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // 4. Interaction (Mouse)
    let mouseX = 0;
    let mouseY = 0;

    // Add subtle parallax based on mouse
    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pause animation when tab is not active
    let isActive = true;
    document.addEventListener('visibilitychange', () => {
        isActive = !document.hidden;
    });

    // Line color (gradient between cyan and purple)
    const lineColorStart = new THREE.Color(0x00F0FF); // Cyan
    const lineColorEnd = new THREE.Color(0x9B59B6);   // Purple

    // 5. Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Skip rendering if tab is not active
        if (!isActive) return;

        const positions = particleSystem.geometry.attributes.position.array;
        const linePos = linesMesh.geometry.attributes.position.array;
        const lineCol = linesMesh.geometry.attributes.color.array;

        // Move camera slightly towards mouse
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Update Particles
        let lineVertexIndex = 0;
        let lineColorIndex = 0;
        const connectionDistance = 40; // How close particles need to be to connect

        for (let i = 0; i < particleCount; i++) {
            // Update position based on velocity
            positions[i * 3] += particleVelocities[i].x;
            positions[i * 3 + 1] += particleVelocities[i].y;
            positions[i * 3 + 2] += particleVelocities[i].z;

            // Boundary Check (Bounce back)
            if (positions[i * 3] < -r / 2 || positions[i * 3] > r / 2) particleVelocities[i].x *= -1;
            if (positions[i * 3 + 1] < -r / 2 || positions[i * 3 + 1] > r / 2) particleVelocities[i].y *= -1;
            if (positions[i * 3 + 2] < -r / 2 || positions[i * 3 + 2] > r / 2) particleVelocities[i].z *= -1;

            // Check connections with all other particles
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < connectionDistance) {
                    // Calculate color based on distance (gradient effect)
                    const alpha = 1 - (dist / connectionDistance);
                    const mixedColor = lineColorStart.clone().lerp(lineColorEnd, 0.5);

                    // Add first point
                    linePos[lineVertexIndex++] = positions[i * 3];
                    linePos[lineVertexIndex++] = positions[i * 3 + 1];
                    linePos[lineVertexIndex++] = positions[i * 3 + 2];

                    // Color for first point
                    lineCol[lineColorIndex++] = mixedColor.r * alpha;
                    lineCol[lineColorIndex++] = mixedColor.g * alpha;
                    lineCol[lineColorIndex++] = mixedColor.b * alpha;

                    // Add second point
                    linePos[lineVertexIndex++] = positions[j * 3];
                    linePos[lineVertexIndex++] = positions[j * 3 + 1];
                    linePos[lineVertexIndex++] = positions[j * 3 + 2];

                    // Color for second point
                    lineCol[lineColorIndex++] = mixedColor.r * alpha;
                    lineCol[lineColorIndex++] = mixedColor.g * alpha;
                    lineCol[lineColorIndex++] = mixedColor.b * alpha;
                }
            }
        }

        // Update Lines
        linesMesh.geometry.setDrawRange(0, lineVertexIndex / 3);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
        particleSystem.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    };

    animate();
};

// Start the animation when DOM is ready
document.addEventListener('DOMContentLoaded', initBackground);