let scene, camera, renderer, ring, particles;
let matrixCanvas, matrixCtx;
let progress = 0;

function init() {
    initThreeJS();
    initMatrixRain();
    animate();
    updateProgress();
}

function initThreeJS() {
    // Set up Three.js scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    createRing();
    createParticles();
}

function createRing() {
    // Create a glowing ring using custom shaders
    const geometry = new THREE.TorusGeometry(1, 0.1, 16, 100);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xffdf00) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float intensity = sin(vUv.x * 50.0 + time) * 0.5 + 0.5;
                gl_FragColor = vec4(color * intensity, 1.0);
            }
        `
    });

    ring = new THREE.Mesh(geometry, material);
    scene.add(ring);
}

function createParticles() {
    // Create particle system for background effect
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0x00ff00,
        size: 0.05,
        transparent: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function initMatrixRain() {
    // Set up Matrix-style raining code effect
    matrixCanvas = document.getElementById('matrix-canvas');
    matrixCtx = matrixCanvas.getContext('2d');

    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const columns = matrixCanvas.width / 20;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function drawMatrixRain() {
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        matrixCtx.fillStyle = '#0F0';
        matrixCtx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            matrixCtx.fillText(text, i * 20, drops[i] * 20);

            if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    setInterval(drawMatrixRain, 50);
}

function animate() {
    requestAnimationFrame(animate);

    // Animate ring and particles
    ring.rotation.x += 0.005;
    ring.rotation.y += 0.01;
    particles.rotation.y += 0.001;

    ring.material.uniforms.time.value += 0.1;

    renderer.render(scene, camera);
}

function updateProgress() {
    // Update loading progress
    progress += 1;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    if (progress < 100) {
        setTimeout(updateProgress, 50);
    } else {
        completeLoading();
    }
}

function completeLoading() {
    // Animate transition from ring to KHOI text
    gsap.to(ring.scale, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.in" });
    gsap.to(particles.material, { opacity: 0, duration: 1 });

    // Create and animate KHOI text
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
        const textGeometry = new THREE.TextGeometry('KHOI', {
            font: font,
            size: 0.5,
            height: 0.1,
        });
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffdf00 });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(-0.75, 0, 0);
        scene.add(text);

        gsap.from(text.scale, { x: 0, y: 0, z: 0, duration: 1, delay: 1, ease: "elastic.out" });

        setTimeout(() => {
            // Transition to your main content here
            alert('Loading complete! Get awakend.');
        }, 3000);
    });
}

window.addEventListener('resize', () => {
    // Handle window resizing
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
});

init();
