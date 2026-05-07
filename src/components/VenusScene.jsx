import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";

function createStars() {
  const count = 6200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 45 + Math.random() * 130;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;

    const warm = Math.random();
    colors[i * 3] = 1;
    colors[i * 3 + 1] = warm > 0.62 ? 0.82 : 0.94;
    colors[i * 3 + 2] = warm > 0.72 ? 0.58 : 0.9;
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
      opacity: 0.88,
      transparent: true,
    }),
  );
}

function createVenusSurfaceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  const base = ctx.createRadialGradient(
    canvas.width * 0.46,
    canvas.height * 0.45,
    canvas.width * 0.04,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.68,
  );
  [
    [0, "#f0a126"],
    [0.18, "#d06d17"],
    [0.35, "#aa4310"],
    [0.53, "#80300f"],
    [0.72, "#b85412"],
    [0.9, "#e88f20"],
    [1, "#58210c"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const wave = Math.sin(y * 0.016) + Math.sin(y * 0.047) * 0.45 + Math.sin(y * 0.091) * 0.22;
    ctx.fillStyle = wave > 0 ? `rgba(255,151,30,${0.035 + wave * 0.05})` : `rgba(55,19,7,${0.05 + Math.abs(wave) * 0.07})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 36000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 6 + 0.35;
    const tone = Math.random();
    ctx.fillStyle =
      tone < 0.28
        ? `rgba(58,19,6,${Math.random() * 0.42})`
        : tone < 0.56
          ? `rgba(156,54,10,${Math.random() * 0.46})`
          : tone < 0.84
            ? `rgba(235,112,14,${Math.random() * 0.42})`
            : `rgba(255,181,56,${Math.random() * 0.38})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * (1.2 + Math.random() * 2.2), radius * (0.45 + Math.random() * 0.7), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark and bright radar-like highland regions.
  [
    [0.18, 0.22, 260, 120, -0.28, "dark"],
    [0.31, 0.58, 350, 170, 0.16, "dark"],
    [0.54, 0.35, 280, 120, 0.38, "dark"],
    [0.78, 0.31, 210, 115, -0.22, "dark"],
    [0.72, 0.67, 320, 140, 0.2, "dark"],
    [0.24, 0.75, 160, 70, -0.18, "bright"],
    [0.47, 0.72, 115, 60, 0.3, "bright"],
    [0.64, 0.52, 95, 50, -0.2, "bright"],
  ].forEach(([nx, ny, rx, ry, rotation, kind]) => {
    const x = canvas.width * nx;
    const y = canvas.height * ny;
    const patch = ctx.createRadialGradient(x, y, 18, x, y, rx);
    if (kind === "bright") {
      patch.addColorStop(0, "rgba(255,218,94,0.72)");
      patch.addColorStop(0.45, "rgba(239,139,25,0.34)");
      patch.addColorStop(1, "rgba(126,47,10,0)");
    } else {
      patch.addColorStop(0, "rgba(42,14,5,0.72)");
      patch.addColorStop(0.55, "rgba(79,25,7,0.42)");
      patch.addColorStop(1, "rgba(181,68,12,0)");
    }
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < 115; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 32 + 5;
    const crater = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    crater.addColorStop(0, "rgba(38,13,4,0.66)");
    crater.addColorStop(0.48, "rgba(107,37,8,0.36)");
    crater.addColorStop(1, "rgba(235,112,18,0)");
    ctx.fillStyle = crater;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,171,56,0.3)";
    ctx.lineWidth = Math.max(0.8, radius * 0.04);
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Tessera-like fracture networks and lava-flow lineaments.
  for (let i = 0; i < 95; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = Math.random() * 260 + 45;
    const angle = Math.random() * Math.PI * 2;
    ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,164,42,${Math.random() * 0.28})` : `rgba(44,15,5,${Math.random() * 0.3})`;
    ctx.lineWidth = Math.random() * 2 + 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * length * 0.48,
      y + Math.sin(angle) * length * 0.48 + (Math.random() - 0.5) * 58,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length,
    );
    ctx.stroke();
  }

  for (let i = 0; i < 18; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = Math.random() * 180 + 80;
    const ry = Math.random() * 80 + 45;
    const patch = ctx.createRadialGradient(x, y, 20, x, y, rx);
    patch.addColorStop(0, "rgba(255,178,47,0.32)");
    patch.addColorStop(0.55, "rgba(69,24,7,0.22)");
    patch.addColorStop(1, "rgba(172,70,12,0)");
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const glow = ctx.createRadialGradient(canvas.width * 0.22, canvas.height * 0.75, 20, canvas.width * 0.22, canvas.height * 0.75, 170);
  glow.addColorStop(0, "rgba(255,230,103,0.78)");
  glow.addColorStop(0.4, "rgba(243,133,22,0.3)");
  glow.addColorStop(1, "rgba(98,33,7,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.22, canvas.height * 0.75, 120, 55, -0.25, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#d8ad65";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 3) {
    const band = Math.sin(y * 0.01) + Math.sin(y * 0.035) * 0.65 + Math.sin(y * 0.073) * 0.25;
    ctx.fillStyle = band > 0 ? `rgba(255,221,144,${0.08 + band * 0.08})` : `rgba(133,78,33,${0.06 + Math.abs(band) * 0.06})`;
    ctx.fillRect(0, y, canvas.width, 3);
  }

  for (let i = 0; i < 18000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 18 + 3;
    ctx.fillStyle = Math.random() > 0.48 ? `rgba(255,230,165,${Math.random() * 0.18})` : `rgba(126,74,34,${Math.random() * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * (2.5 + Math.random() * 3.5), radius * 0.36, Math.random() * Math.PI * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Broad Y-shaped UV-like cloud structures.
  ctx.strokeStyle = "rgba(102,62,34,0.22)";
  ctx.lineWidth = 38;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.18, canvas.height * 0.25);
  ctx.bezierCurveTo(canvas.width * 0.38, canvas.height * 0.42, canvas.width * 0.52, canvas.height * 0.48, canvas.width * 0.75, canvas.height * 0.62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.27, canvas.height * 0.78);
  ctx.bezierCurveTo(canvas.width * 0.46, canvas.height * 0.55, canvas.width * 0.56, canvas.height * 0.5, canvas.width * 0.78, canvas.height * 0.34);
  ctx.stroke();

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

  for (let i = 0; i < 19000; i += 1) {
    const value = 78 + Math.random() * 92;
    ctx.fillStyle = `rgb(${value},${value},${value})`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 4 + 0.5, Math.random() * 3 + 0.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createAtmosphereMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { cameraPositionWorld: { value: new THREE.Vector3() } },
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
        float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.7);
        vec3 color = mix(vec3(1.0, 0.62, 0.25), vec3(1.0, 0.88, 0.54), fresnel);
        gl_FragColor = vec4(color, fresnel * 0.42);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    transparent: true,
  });
}

function VenusScene({ isPaused, onPausedChange, showAtmosphere = true, showClouds = true, showSurface = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050201);
    scene.fog = new THREE.FogExp2(0x080301, 0.000018);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.45, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);
    const releaseInteractionLock = lockSceneInteraction(container, renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.34;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 2.8;
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.18;
    controls.enablePan = false;

    scene.add(createStars());
    scene.add(new THREE.AmbientLight(0x2a1708, 1.15));
    const sun = new THREE.DirectionalLight(0xfff0ce, 4.3);
    sun.position.set(9, 4, 8);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xff9a45, 1.45);
    fill.position.set(-5, -1, -6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffcf75, 1.8);
    rim.position.set(0, -2, -8);
    scene.add(rim);

    const venusGroup = new THREE.Group();
    const surfaceTexture = createVenusSurfaceTexture();
    const cloudTexture = createCloudTexture();
    const bumpTexture = createBumpTexture();

    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(1.78, 192, 192),
      new THREE.MeshStandardMaterial({
        map: surfaceTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.035,
        roughness: 0.74,
        metalness: 0.02,
      }),
    );
    venusGroup.add(surface);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.84, 192, 192),
      new THREE.MeshStandardMaterial({
        map: cloudTexture,
        color: 0xffd083,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        roughness: 0.5,
        metalness: 0.02,
      }),
    );
    venusGroup.add(clouds);

    const atmosphereMaterial = createAtmosphereMaterial();
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.95, 160, 160), atmosphereMaterial);
    venusGroup.add(atmosphere);
    scene.add(venusGroup);

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
      surface.visible = showSurface;
      clouds.visible = showClouds;
      atmosphere.visible = showAtmosphere;
      atmosphereMaterial.uniforms.cameraPositionWorld.value.copy(camera.position);

      if (!isPaused) {
        surface.rotation.y -= 0.00013;
        clouds.rotation.y += 0.00036;
        clouds.rotation.x = Math.sin(Date.now() * 0.00008) * 0.015;
        atmosphere.rotation.y += 0.00022;
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
      surfaceTexture.dispose();
      cloudTexture.dispose();
      bumpTexture.dispose();
      renderer.dispose();
      releaseInteractionLock();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showAtmosphere, showClouds, showSurface]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default VenusScene;
