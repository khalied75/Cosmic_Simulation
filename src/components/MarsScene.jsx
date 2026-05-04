import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createStars() {
  const count = 6500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 45 + Math.random() * 125;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;

    const type = Math.random();
    colors[i * 3] = type < 0.12 ? 0.65 : 1;
    colors[i * 3 + 1] = type < 0.35 ? 0.78 : type < 0.72 ? 0.9 : 0.58;
    colors[i * 3 + 2] = type < 0.12 ? 1 : type < 0.72 ? 0.72 : 0.42;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.9,
      transparent: true,
    }),
  );
}

function drawCrater(ctx, x, y, radius, opacity = 1) {
  const shadow = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius);
  shadow.addColorStop(0, `rgba(45,18,8,${0.82 * opacity})`);
  shadow.addColorStop(0.38, `rgba(92,35,14,${0.52 * opacity})`);
  shadow.addColorStop(0.68, `rgba(145,62,24,${0.32 * opacity})`);
  shadow.addColorStop(1, "rgba(205,102,50,0)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(232,150,91,${0.32 * opacity})`;
  ctx.lineWidth = Math.max(0.7, radius * 0.05);
  ctx.beginPath();
  ctx.arc(x - radius * 0.06, y - radius * 0.08, radius * 0.92, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(72,25,10,${0.22 * opacity})`;
  ctx.lineWidth = Math.max(0.8, radius * 0.07);
  ctx.beginPath();
  ctx.arc(x + radius * 0.08, y + radius * 0.08, radius * 1.18, 0, Math.PI * 2);
  ctx.stroke();
}

function createMarsTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  [
    [0, "#efd7bd"],
    [0.07, "#dbaf86"],
    [0.17, "#c76f42"],
    [0.29, "#9d3e1d"],
    [0.41, "#b95327"],
    [0.52, "#d0743f"],
    [0.63, "#a34120"],
    [0.76, "#cf8054"],
    [0.91, "#e5b996"],
    [1, "#f5e1cc"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const band = Math.sin(y * 0.014) + Math.sin(y * 0.039) * 0.35;
    ctx.fillStyle = band > 0 ? `rgba(245,146,78,${0.03 + band * 0.045})` : `rgba(91,29,12,${0.04 + Math.abs(band) * 0.055})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 36000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 4.5 + 0.2;
    const tone = Math.random();
    ctx.fillStyle =
      tone < 0.22
        ? `rgba(115,37,16,${Math.random() * 0.38})`
        : tone < 0.48
          ? `rgba(210,88,36,${Math.random() * 0.42})`
          : tone < 0.76
            ? `rgba(244,143,74,${Math.random() * 0.36})`
            : `rgba(72,25,12,${Math.random() * 0.28})`;

    ctx.beginPath();
    if (Math.random() < 0.62) {
      ctx.ellipse(x, y, radius * (1.2 + Math.random() * 2.8), radius * (0.35 + Math.random() * 0.8), Math.random() * Math.PI, 0, Math.PI * 2);
    } else {
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Dark albedo regions inspired by Syrtis Major and Terra Cimmeria.
  [
    [0.7, 0.42, 360, 160, -0.22],
    [0.2, 0.58, 430, 145, 0.12],
    [0.58, 0.62, 280, 110, 0.35],
    [0.34, 0.33, 250, 105, -0.1],
  ].forEach(([nx, ny, rx, ry, rotation]) => {
    const x = canvas.width * nx;
    const y = canvas.height * ny;
    const plain = ctx.createRadialGradient(x, y, 20, x, y, rx);
    plain.addColorStop(0, "rgba(84,31,17,0.56)");
    plain.addColorStop(0.48, "rgba(103,39,19,0.34)");
    plain.addColorStop(1, "rgba(198,92,45,0)");
    ctx.fillStyle = plain;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
    ctx.fill();
  });

  // Olympus Mons and the Tharsis volcanic province.
  [
    [0.29, 0.43, 96],
    [0.36, 0.39, 70],
    [0.39, 0.48, 76],
    [0.45, 0.42, 66],
  ].forEach(([nx, ny, radius]) => {
    const x = canvas.width * nx;
    const y = canvas.height * ny;
    const volcano = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius);
    volcano.addColorStop(0, "rgba(86,28,12,0.75)");
    volcano.addColorStop(0.18, "rgba(193,82,34,0.62)");
    volcano.addColorStop(0.62, "rgba(232,127,65,0.26)");
    volcano.addColorStop(1, "rgba(220,116,58,0)");
    ctx.fillStyle = volcano;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    drawCrater(ctx, x, y, radius * 0.2, 0.55);
  });

  // Valles Marineris: long canyon system.
  const canyonY = canvas.height * 0.52;
  ctx.strokeStyle = "rgba(57,18,8,0.56)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.36, canyonY);
  ctx.bezierCurveTo(canvas.width * 0.45, canyonY - 55, canvas.width * 0.57, canyonY + 70, canvas.width * 0.72, canyonY - 18);
  ctx.stroke();
  ctx.strokeStyle = "rgba(238,139,78,0.22)";
  ctx.lineWidth = 5;
  ctx.stroke();

  for (let i = 0; i < 125; i += 1) {
    drawCrater(ctx, Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 26 + 3, 0.55 + Math.random() * 0.45);
  }

  for (let i = 0; i < 65; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = Math.random() * 230 + 35;
    const angle = Math.random() * Math.PI * 2;
    ctx.strokeStyle = `rgba(75,25,10,${Math.random() * 0.26})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * length * 0.45,
      y + Math.sin(angle) * length * 0.45 + (Math.random() - 0.5) * 44,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length,
    );
    ctx.stroke();
  }

  const northCap = ctx.createRadialGradient(canvas.width / 2, 0, 18, canvas.width / 2, 0, 435);
  northCap.addColorStop(0, "rgba(255,252,245,0.96)");
  northCap.addColorStop(0.18, "rgba(246,237,220,0.78)");
  northCap.addColorStop(0.42, "rgba(226,205,180,0.42)");
  northCap.addColorStop(1, "rgba(210,155,110,0)");
  ctx.fillStyle = northCap;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.31);

  const southCap = ctx.createRadialGradient(canvas.width / 2, canvas.height, 22, canvas.width / 2, canvas.height, 390);
  southCap.addColorStop(0, "rgba(255,252,245,0.9)");
  southCap.addColorStop(0.2, "rgba(246,237,220,0.68)");
  southCap.addColorStop(0.48, "rgba(225,205,178,0.34)");
  southCap.addColorStop(1, "rgba(210,155,110,0)");
  ctx.fillStyle = southCap;
  ctx.fillRect(0, canvas.height * 0.71, canvas.width, canvas.height * 0.29);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createBumpTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 22000; i += 1) {
    const value = 84 + Math.random() * 95;
    ctx.fillStyle = `rgb(${value},${value},${value})`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 0.4, Math.random() * 3 + 0.4);
  }

  for (let i = 0; i < 100; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 20 + 3;
    const grad = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
    grad.addColorStop(0, "#242424");
    grad.addColorStop(0.68, "#8d8d8d");
    grad.addColorStop(1, "#d6d6d6");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMoonTexture(baseColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `#${baseColor.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 900; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.22)";
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, Math.random() * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createDustShell() {
  const count = 900;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 1.95 + Math.random() * 0.45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xd99a65,
      size: 0.018,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.32,
      transparent: true,
    }),
  );
}

function MarsScene({ isPaused, onPausedChange, showAtmosphere = true, showMoons = true, showDust = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020100);
    scene.fog = new THREE.FogExp2(0x040100, 0.00002);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.55, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.38;
    controls.zoomSpeed = 0.95;
    controls.minDistance = 2.7;
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.24;
    controls.target.set(0, 0, 0);

    scene.add(createStars());
    scene.add(new THREE.AmbientLight(0x2b160d, 1.2));
    const sunLight = new THREE.DirectionalLight(0xfff2dd, 4.2);
    sunLight.position.set(10, 4, 8);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0xff8752, 1.4);
    fillLight.position.set(-4, -1, -5);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xff9b66, 1.5);
    rimLight.position.set(0, -2, -7);
    scene.add(rimLight);

    const marsTexture = createMarsTexture();
    const bumpTexture = createBumpTexture();
    const marsGroup = new THREE.Group();
    const marsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 256, 256),
      new THREE.MeshStandardMaterial({
        map: marsTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.052,
        roughness: 0.72,
        metalness: 0.02,
      }),
    );
    marsGroup.add(marsMesh);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: { cameraPositionWorld: { value: camera.position.clone() } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        uniform vec3 cameraPositionWorld;
        void main() {
          vec3 viewDirection = normalize(cameraPositionWorld - vWorldPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 4.2);
          vec3 color = mix(vec3(1.0, 0.58, 0.32), vec3(0.92, 0.74, 0.55), fresnel);
          gl_FragColor = vec4(color, fresnel * 0.18);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.88, 160, 160), atmosphereMaterial);
    marsGroup.add(atmosphere);

    const dustShell = createDustShell();
    marsGroup.add(dustShell);
    scene.add(marsGroup);

    const moonTextures = [];
    const moonData = [
      { name: "Phobos", color: 0x77716a, size: 0.075, distance: 3.0, speed: 0.0105, tilt: 0.08 },
      { name: "Deimos", color: 0x8a8278, size: 0.048, distance: 4.65, speed: 0.0042, tilt: -0.14 },
    ];
    const moonObjects = moonData.map((moon, index) => {
      const orbit = new THREE.Group();
      orbit.rotation.x = moon.tilt;
      orbit.rotation.y = index * Math.PI * 0.7;

      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 257 }, (_, pointIndex) => {
            const angle = (pointIndex / 256) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(angle) * moon.distance, 0, Math.sin(angle) * moon.distance);
          }),
        ),
        new THREE.LineBasicMaterial({ color: 0x6b3a22, transparent: true, opacity: 0.26 }),
      );
      scene.add(orbitLine);

      const texture = createMoonTexture(moon.color);
      moonTextures.push(texture);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(moon.size, 32, 32),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.86 }),
      );
      mesh.scale.set(1.35, 0.78, 0.92);
      mesh.position.set(moon.distance, 0, 0);
      orbit.add(mesh);
      scene.add(orbit);
      return { orbit, mesh, orbitLine, speed: moon.speed };
    });

    const handleDoubleClick = () => onPausedChange?.(!isPaused);
    renderer.domElement.addEventListener("dblclick", handleDoubleClick);

    let frameId;
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    const animate = () => {
      controls.autoRotate = !isPaused;
      controls.update();
      atmosphere.visible = showAtmosphere;
      dustShell.visible = showDust;
      moonObjects.forEach((moon) => {
        moon.orbit.visible = showMoons;
        moon.orbitLine.visible = showMoons;
      });
      atmosphereMaterial.uniforms.cameraPositionWorld.value.copy(camera.position);

      if (!isPaused) {
        marsMesh.rotation.y += 0.00042;
        atmosphere.rotation.y += 0.00018;
        dustShell.rotation.y += 0.0006;
        dustShell.rotation.x += 0.00012;
        moonObjects.forEach((moon) => {
          moon.orbit.rotation.y += moon.speed;
          moon.mesh.rotation.y += 0.004;
        });
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      controls.dispose();
      marsTexture.dispose();
      bumpTexture.dispose();
      moonTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showAtmosphere, showDust, showMoons]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default MarsScene;
