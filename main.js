// Simulation Variables
let scene, camera, renderer, controls;
let magnetar, fieldLines;
let animationId;
let gui;

const params = {
    // Readings
    currentScale: 1,
    currentRotationSpeed: 0.01,
    temperature: "Red",

    // Settings
    baseRotationSpeed: 0.01,
    collapseSpeed: 0.002,
    fieldLineOpacity: 0.4,

    // Actions
    toggleCollapse: function() {
        isCollapsing = !isCollapsing;
        const btn = document.getElementById('start-btn');
        if(btn) btn.innerText = isCollapsing ? "Pause Collapse" : "Resume Collapse";
    },
    reset: resetSimulation
};

let isCollapsing = false;

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;
    camera.position.y = 2;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create Magnetar
    createMagnetar();

    // Create Field Lines
    createFieldLines();

    // Create Starfield
    createStarfield();

    // Create GUI
    createGUI();

    // Animation Loop
    animate();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);

    // Map existing buttons to GUI logic
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        params.toggleCollapse();
    });

    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
}

function createGUI() {
    gui = new lil.GUI({ title: 'Magnetar Controls' });

    const folderReadings = gui.addFolder('Readings');
    folderReadings.add(params, 'currentScale').name('Radius (r)').listen().disable();
    folderReadings.add(params, 'currentRotationSpeed').name('Rotation Speed').listen().disable();
    folderReadings.add(params, 'temperature').name('Temp Class').listen().disable();

    const folderSettings = gui.addFolder('Settings');
    folderSettings.add(params, 'baseRotationSpeed', 0, 0.1).name('Base Rotation');
    folderSettings.add(params, 'collapseSpeed', 0.001, 0.01).name('Collapse Rate');
    folderSettings.add(params, 'fieldLineOpacity', 0, 1).name('Field Opacity').onChange(v => {
        fieldLines.children.forEach(line => line.material.opacity = v);
    });

    const folderActions = gui.addFolder('Actions');
    folderActions.add(params, 'toggleCollapse').name('Start/Pause');
    folderActions.add(params, 'reset').name('Reset System');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function resetSimulation() {
    isCollapsing = false;
    params.currentScale = 1;
    params.currentRotationSpeed = params.baseRotationSpeed;
    params.temperature = "Red";

    magnetar.scale.set(1, 1, 1);

    // Reset color to initial red-orange
    const initialColor = new THREE.Color(0xff3300);
    magnetar.material.color.set(initialColor);
    magnetar.material.emissive.set(0xcc1100);

    const btn = document.getElementById('start-btn');
    if(btn) btn.innerText = "Start Collapse";
}

function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update orbit controls

    if (isCollapsing) {
        if (params.currentScale > 0.2) {
            params.currentScale -= params.collapseSpeed;
            // Conservation of angular momentum: omega ~ 1/r^2
            params.currentRotationSpeed = params.baseRotationSpeed / (params.currentScale * params.currentScale);

            // Shift color logic
            const initialColor = new THREE.Color(0xff3300);
            const initialEmissive = new THREE.Color(0xcc1100);
            const finalColor = new THREE.Color(0x88ccff);

            const progress = (1 - params.currentScale) / 0.8; // 0 to 1

            magnetar.material.emissive.lerpColors(initialEmissive, finalColor, progress);
            magnetar.material.color.lerpColors(initialColor, finalColor, progress);

            // Update temperature reading
            if (progress < 0.3) params.temperature = "Red (Warm)";
            else if (progress < 0.6) params.temperature = "Orange (Hot)";
            else if (progress < 0.9) params.temperature = "White (Very Hot)";
            else params.temperature = "Blue (Extreme)";
        }
    } else {
        // Even if not collapsing, update rotation speed if base speed changed
        if (params.currentScale === 1) {
             params.currentRotationSpeed = params.baseRotationSpeed;
        }
    }

    magnetar.rotation.y += params.currentRotationSpeed;
    magnetar.scale.set(params.currentScale, params.currentScale, params.currentScale);

    renderer.render(scene, camera);
}

function createMagnetar() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff3300,
        emissive: 0xcc1100,
        emissiveIntensity: 1.0, // Increased intensity for better glow
        roughness: 0.2, // Smoother surface
        metalness: 1.0 // Very metallic for "magnetic" feel
    });
    magnetar = new THREE.Mesh(geometry, material);
    scene.add(magnetar);

    // Add a point light at the center to represent the intense energy
    const light = new THREE.PointLight(0xff5500, 3, 100); // Increased intensity and range
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

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
        // Randomly scatter stars in a large radius
        positions[i] = (Math.random() - 0.5) * 100;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });

    const starfield = new THREE.Points(geometry, material);
    scene.add(starfield);
}

init();
