// Simulation Variables
let scene, camera, renderer;
let magnetar, fieldLines;
let animationId;
let isCollapsing = false;
let rotationSpeed = 0.01;
let scale = 1;

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create Magnetar
    createMagnetar();

    // Create Field Lines
    createFieldLines();

    // Animation Loop
    animate();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('start-btn').addEventListener('click', startCollapse);
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startCollapse() {
    isCollapsing = true;
}

function resetSimulation() {
    isCollapsing = false;
    rotationSpeed = 0.01;
    scale = 1;
    magnetar.scale.set(1, 1, 1);

    // Reset color to initial red-orange
    const initialColor = new THREE.Color(0xff3300);
    magnetar.material.color.set(initialColor);
    magnetar.material.emissive.set(0xcc1100); // Slightly darker for emissive base
}

function animate() {
    requestAnimationFrame(animate);

    if (isCollapsing) {
        if (scale > 0.2) {
            scale -= 0.002;
            // Approximate conservation of angular momentum: omega ~ 1/r^2
            // Base speed 0.01 at scale 1.
            rotationSpeed = 0.01 / (scale * scale);

            // Shift color towards blue/white as it collapses (hotter)
            const initialColor = new THREE.Color(0xff3300);
            const initialEmissive = new THREE.Color(0xcc1100);
            const finalColor = new THREE.Color(0x88ccff);

            const progress = (1 - scale) / 0.8; // 0 to 1

            magnetar.material.emissive.lerpColors(initialEmissive, finalColor, progress);
            magnetar.material.color.lerpColors(initialColor, finalColor, progress);
        }
    }

    magnetar.rotation.y += rotationSpeed;
    magnetar.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
}

function createMagnetar() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff3300,
        emissive: 0xcc1100,
        emissiveIntensity: 0.8,
        roughness: 0.4,
        metalness: 0.8
    });
    magnetar = new THREE.Mesh(geometry, material);
    scene.add(magnetar);

    // Add a point light at the center to represent the intense energy
    const light = new THREE.PointLight(0xff5500, 2, 50);
    magnetar.add(light);

    // Add ambient light for general visibility
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
}

function createFieldLines() {
    fieldLines = new THREE.Group();
    magnetar.add(fieldLines);

    const numLines = 32;
    const material = new THREE.LineBasicMaterial({ color: 0x00aaff, opacity: 0.4, transparent: true });

    for (let i = 0; i < numLines; i++) {
        const points = [];
        const angle = (i / numLines) * Math.PI * 2;
        const radius = 2.5;

        for (let t = 0; t <= Math.PI; t += 0.1) {
            // Parametric equation for an ellipse
            const x = Math.sin(t) * radius * Math.cos(angle);
            const z = Math.sin(t) * radius * Math.sin(angle);
            const y = Math.cos(t) * radius * 0.6; // Flatten slightly so it looks like it emerges from poles more
            points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        fieldLines.add(line);
    }
}

init();
