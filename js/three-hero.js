// ============================================================
// PHYSICAL GRAFFITI — CINEMA-GRADE PHOTOREALISTIC CAMERA TRACKING
// High-Fashion Victorian Skeletal Inkers & Parlour Walkthrough
// ============================================================

(function () {
  const container = document.getElementById('hero-3d-wrapper');
  const canvas = document.getElementById('three-hero-canvas');
  if (!container || !canvas) return;

  // 1. THREE.JS SCENE SETUP
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. LOAD 5 PHOTOREALISTIC 4K CAMERA TRACKING KEYFRAMES
  const textureLoader = new THREE.TextureLoader();
  let loadedCount = 0;
  const totalTextures = 5;

  function setupTexture(url) {
    const tex = textureLoader.load(url, (t) => {
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
      loadedCount++;
      if (loadedCount === totalTextures) {
        document.body.classList.add('parlour-3d-ready');
      }
    });
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  const tex0 = setupTexture('assets/images/track_01_entrance.jpg');
  const tex1 = setupTexture('assets/images/track_02_archibald.jpg');
  const tex2 = setupTexture('assets/images/track_03_evangeline.jpg');
  const tex3 = setupTexture('assets/images/track_04_session.jpg');
  const tex4 = setupTexture('assets/images/track_05_sanctum.jpg');

  // 3. GLSL CINEMATIC CAMERA TRACKING SHADER
  const trackingUniforms = {
    uTex0: { value: tex0 },
    uTex1: { value: tex1 },
    uTex2: { value: tex2 },
    uTex3: { value: tex3 },
    uTex4: { value: tex4 },
    uProgress: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uImageRes: { value: new THREE.Vector2(1920, 1080) },
    uTime: { value: 0.0 },
    uVelocity: { value: 0.0 }
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTex0;
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform sampler2D uTex3;
    uniform sampler2D uTex4;
    uniform float uProgress;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec2 uImageRes;
    uniform float uTime;
    uniform float uVelocity;
    varying vec2 vUv;

    // Responsive Object-Fit Cover Math
    vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
      float screenAspect = screenRes.x / screenRes.y;
      float imgAspect = imgRes.x / imgRes.y;
      vec2 newUv = uv;
      if (screenAspect > imgAspect) {
        float scale = screenAspect / imgAspect;
        newUv.y = (uv.y - 0.5) * (1.0 / scale) + 0.5;
      } else {
        float scale = imgAspect / screenAspect;
        newUv.x = (uv.x - 0.5) * (1.0 / scale) + 0.5;
      }
      return newUv;
    }

    // Sample texture with subtle chromatic aberration on camera velocity
    vec4 sampleChromatic(sampler2D tex, vec2 uv, float aberration) {
      vec2 dir = normalize(uv - vec2(0.5) + vec2(0.0001, 0.0001));
      float r = texture2D(tex, uv + dir * aberration).r;
      float g = texture2D(tex, uv).g;
      float b = texture2D(tex, uv - dir * aberration).b;
      return vec4(r, g, b, 1.0);
    }

    void main() {
      vec2 baseUv = getCoverUv(vUv, uResolution, uImageRes);

      // Interactive 3D Perspective Parallax via Mouse Look-Around
      vec2 mouseShift = uMouse * 0.024;
      float centerDist = length(baseUv - vec2(0.5));
      float parallaxFactor = 1.0 - centerDist * 0.45;
      baseUv += mouseShift * parallaxFactor;

      // Subtle atmospheric lens barrel curvature
      vec2 centered = baseUv - 0.5;
      baseUv = 0.5 + centered * (1.0 + 0.025 * dot(centered, centered));

      // Camera travel progression across 4 segments (5 keyframes)
      float p = clamp(uProgress, 0.0, 0.9999);
      float scaledP = p * 4.0;
      int seg = int(floor(scaledP));
      float t = fract(scaledP);

      // Smooth Hermite cubic interpolation for realistic camera momentum
      float easeT = smoothstep(0.0, 1.0, t);

      // Optical Dolly-Zoom coordinate transformation
      vec4 colorA = vec4(0.0);
      vec4 colorB = vec4(0.0);
      float aberration = clamp(abs(uVelocity) * 0.012, 0.0, 0.015);

      if (seg == 0) {
        // SEGMENT 0: Entrance Foyer -> Lord Archibald Graves (Dolly in & pan left)
        vec2 focalA = vec2(0.32, 0.58);
        vec2 focalB = vec2(0.32, 0.58);
        vec2 uvA = (baseUv - focalA) * (1.0 - easeT * 0.22) + focalA;
        vec2 uvB = (baseUv - focalB) * (1.0 + (1.0 - easeT) * 0.14) + focalB;
        colorA = sampleChromatic(uTex0, uvA, aberration);
        colorB = sampleChromatic(uTex1, uvB, aberration);
      } else if (seg == 1) {
        // SEGMENT 1: Lord Archibald -> Lady Evangeline Marrow (Dolly past Archibald, pan right)
        vec2 focalA = vec2(0.68, 0.52);
        vec2 focalB = vec2(0.68, 0.52);
        vec2 uvA = (baseUv - focalA) * (1.0 - easeT * 0.20) + focalA;
        vec2 uvB = (baseUv - focalB) * (1.0 + (1.0 - easeT) * 0.12) + focalB;
        colorA = sampleChromatic(uTex1, uvA, aberration);
        colorB = sampleChromatic(uTex2, uvB, aberration);
      } else if (seg == 2) {
        // SEGMENT 2: Lady Evangeline -> Central Tattoo Chamber (Dolly in to oxblood recliner)
        vec2 focalA = vec2(0.50, 0.55);
        vec2 focalB = vec2(0.50, 0.55);
        vec2 uvA = (baseUv - focalA) * (1.0 - easeT * 0.24) + focalA;
        vec2 uvB = (baseUv - focalB) * (1.0 + (1.0 - easeT) * 0.14) + focalB;
        colorA = sampleChromatic(uTex2, uvA, aberration);
        colorB = sampleChromatic(uTex3, uvB, aberration);
      } else {
        // SEGMENT 3: Central Chamber -> Grand Sanctum Grimoire Altar (Dolly under rose window)
        vec2 focalA = vec2(0.50, 0.52);
        vec2 focalB = vec2(0.50, 0.52);
        vec2 uvA = (baseUv - focalA) * (1.0 - easeT * 0.28) + focalA;
        vec2 uvB = (baseUv - focalB) * (1.0 + (1.0 - easeT) * 0.16) + focalB;
        colorA = sampleChromatic(uTex3, uvA, aberration);
        colorB = sampleChromatic(uTex4, uvB, aberration);
      }

      // Non-linear cross-dissolve with optical depth transition
      vec4 finalColor = mix(colorA, colorB, easeT);

      // Gaslight warmth modulation & candle flicker
      float gaslightFlicker = sin(uTime * 3.8) * 0.015 + cos(uTime * 7.2) * 0.008;
      finalColor.rgb += vec3(0.025, 0.018, 0.005) * gaslightFlicker;

      // Authentic Victorian Vignette (soft burnt mahogany perimeter)
      float vignette = 1.0 - smoothstep(0.25, 0.85, centerDist);
      finalColor.rgb *= (0.35 + 0.65 * vignette);

      // Subtle 35mm cinematic film grain
      float grain = (fract(sin(dot(vUv * (uTime + 1.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.035;
      finalColor.rgb += grain;

      gl_FragColor = finalColor;
    }
  `;

  // Fullscreen Quad with Custom Shader
  const trackingMat = new THREE.ShaderMaterial({
    uniforms: trackingUniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    depthWrite: false,
    depthTest: false
  });

  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const quadMesh = new THREE.Mesh(quadGeo, trackingMat);
  scene.add(quadMesh);

  // 4. REAL-TIME 3D VOLUMETRIC EMBER & SMOKE PARTICLES
  // These float in true 3D space in front of the camera, delivering genuine depth
  const particleCount = 220;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particlePhases = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 24;      // X
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 16;  // Y
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;  // Z
    particleSizes[i] = Math.random() * 4.5 + 2.0;
    particlePhases[i] = Math.random() * Math.PI * 2;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  // Ember Particle Shader
  const emberVertexShader = `
    attribute float size;
    varying float vAlpha;
    uniform float uTime;
    uniform vec2 uMouse;
    void main() {
      vec3 pos = position;
      // Gentle floating oscillation
      pos.y += sin(uTime * 0.8 + position.x) * 0.35;
      pos.x += cos(uTime * 0.6 + position.y) * 0.25;
      pos.z += sin(uTime * 0.5 + position.z) * 0.3;

      // Mouse draft effect
      pos.x += uMouse.x * 1.5 * (1.0 / (abs(pos.z) + 1.0));
      pos.y += uMouse.y * 1.5 * (1.0 / (abs(pos.z) + 1.0));

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (18.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;

      // Soft distance fade
      vAlpha = smoothstep(25.0, 5.0, -mvPosition.z) * smoothstep(0.5, 3.0, -mvPosition.z);
    }
  `;

  const emberFragmentShader = `
    varying float vAlpha;
    void main() {
      // Soft radial glowing particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      float glow = smoothstep(0.5, 0.0, dist);

      // Glowing Victorian Gaslight Gold Color
      vec3 emberColor = mix(vec3(0.95, 0.75, 0.35), vec3(1.0, 0.92, 0.65), glow);
      gl_FragColor = vec4(emberColor, glow * vAlpha * 0.75);
    }
  `;

  const emberMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: emberVertexShader,
    fragmentShader: emberFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const emberParticles = new THREE.Points(particleGeo, emberMat);
  scene.add(emberParticles);

  // 5. INTERACTIVE SCROLL & CAMERA TRACKING ENGINE
  let currentProgress = 0;
  let targetProgress = 0;
  let lastProgress = 0;
  let velocity = 0;

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Track Mouse for 3D Look-Around & Perspective Parallax
  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Calculate Scroll Distance inside the 3D Hero Wrapper
  function updateScrollProgress() {
    const rect = container.getBoundingClientRect();
    const scrollTotal = container.offsetHeight - window.innerHeight;
    if (scrollTotal <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollTotal));
    targetProgress = progress;
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // 6. HUD CHECKPOINTS & SOUND COIL MODULATION
  const hudCheckpoints = document.querySelectorAll('.hud-checkpoint');
  const progressFill = document.getElementById('camera-progress-fill');
  const waypointPills = document.querySelectorAll('.waypoint-pill');

  function updateHUD(progress) {
    if (progressFill) {
      progressFill.style.width = (progress * 100).toFixed(1) + '%';
    }

    hudCheckpoints.forEach((checkpoint) => {
      const start = parseFloat(checkpoint.getAttribute('data-start') || '0');
      const end = parseFloat(checkpoint.getAttribute('data-end') || '1');
      if (progress >= start && progress <= end) {
        checkpoint.classList.add('active');
      } else {
        checkpoint.classList.remove('active');
      }
    });

    // Update active waypoint pill
    waypointPills.forEach((pill) => {
      const target = parseFloat(pill.getAttribute('data-target') || '0');
      if (Math.abs(progress - target) < 0.12) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Modulate Tattoo Machine Buzz Sound in app.js if available
    if (window.tattooAudio && typeof window.tattooAudio.updatePosition === 'function') {
      window.tattooAudio.updatePosition(progress);
    }
  }

  // Interactive Waypoint Navigation Click
  waypointPills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const target = parseFloat(pill.getAttribute('data-target') || '0');
      const containerTop = container.offsetTop;
      const scrollTotal = container.offsetHeight - window.innerHeight;
      const targetScroll = containerTop + target * scrollTotal;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  });

  // 7. RESPONSIVE RESIZE LISTENER
  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    trackingUniforms.uResolution.value.set(width, height);
  }
  window.addEventListener('resize', onResize);

  // 8. RENDER LOOP (60FPS+ SMOOTH LERP)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth Lerp for Camera Progress (Butter-smooth momentum)
    currentProgress += (targetProgress - currentProgress) * 0.085;
    velocity = (currentProgress - lastProgress) / Math.max(delta, 0.016);
    lastProgress = currentProgress;

    // Smooth Lerp for Mouse 3D Look-Around
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;

    // Update Shader Uniforms
    trackingUniforms.uProgress.value = currentProgress;
    trackingUniforms.uMouse.value.set(mouseX, mouseY);
    trackingUniforms.uTime.value = elapsedTime;
    trackingUniforms.uVelocity.value = velocity;

    // Update 3D Particles
    emberMat.uniforms.uTime.value = elapsedTime;
    emberMat.uniforms.uMouse.value.set(mouseX, mouseY);

    // Three.js Camera 3D Translation along Z based on scroll
    // Camera physically tracks through the 3D particle space
    camera.position.z = 10.0 - currentProgress * 12.0;
    camera.position.x = mouseX * 0.8;
    camera.position.y = mouseY * 0.6;
    camera.lookAt(0, 0, -10);

    // Update HUD overlay elements
    updateHUD(currentProgress);

    // Render Scene
    renderer.render(scene, camera);
  }

  animate();
})();
