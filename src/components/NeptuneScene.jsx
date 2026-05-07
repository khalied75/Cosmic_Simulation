import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";

function createStars() {
  const count = 7200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 48 + Math.random() * 140;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;

    const blue = Math.random();
    colors[i * 3] = blue < 0.28 ? 0.58 : 0.9;
    colors[i * 3 + 1] = blue < 0.28 ? 0.72 : 0.9;
    colors[i * 3 + 2] = 1;
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

function createNeptuneTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  [
    [0, "#3d5cff"],
    [0.16, "#54a9ff"],
    [0.32, "#2d79ff"],
    [0.49, "#1e48d8"],
    [0.66, "#3159f5"],
    [0.82, "#1832a8"],
    [1, "#11206c"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const band = Math.sin(y * 0.01) + Math.sin(y * 0.031) * 0.5 + Math.sin(y * 0.083) * 0.22;
    ctx.fillStyle =
      band > 0
        ? `rgba(92,190,255,${0.035 + band * 0.048})`
        : `rgba(8,28,130,${0.04 + Math.abs(band) * 0.065})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 18000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 10 + 1;
    const tone = Math.random();
    ctx.fillStyle =
      tone < 0.36
        ? `rgba(16,47,175,${Math.random() * 0.24})`
        : tone < 0.72
          ? `rgba(89,183,255,${Math.random() * 0.2})`
          : `rgba(7,19,91,${Math.random() * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * (3 + Math.random() * 6), radius * 0.26, Math.random() * Math.PI * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright storm complex, intentionally similar to the reference image.
  const stormX = canvas.width * 0.47;
  const stormY = canvas.height * 0.52;
  for (let i = 0; i < 7; i += 1) {
    const radius = 26 + i * 17;
    ctx.strokeStyle = `rgba(210,245,255,${0.42 - i * 0.045})`;
    ctx.lineWidth = Math.max(2, 10 - i);
    ctx.beginPath();
    ctx.ellipse(stormX + i * 7, stormY - i * 2, radius * 1.55, radius * 0.62, -0.72, 0, Math.PI * 1.55);
    ctx.stroke();
  }
  const stormGlow = ctx.createRadialGradient(stormX, stormY, 8, stormX, stormY, 150);
  stormGlow.addColorStop(0, "rgba(245,255,255,0.92)");
  stormGlow.addColorStop(0.22, "rgba(133,221,255,0.52)");
  stormGlow.addColorStop(0.56, "rgba(60,118,255,0.22)");
  stormGlow.addColorStop(1, "rgba(28,48,180,0)");
  ctx.fillStyle = stormGlow;
  ctx.beginPath();
  ctx.ellipse(stormX, stormY, 145, 82, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Dark blue lower belt.
  const belt = ctx.createLinearGradient(0, canvas.height * 0.68, 0, canvas.height * 0.83);
  belt.addColorStop(0, "rgba(20,39,166,0)");
  belt.addColorStop(0.45, "rgba(8,22,102,0.42)");
  belt.addColorStop(1, "rgba(43,74,214,0)");
  ctx.fillStyle = belt;
  ctx.fillRect(0, canvas.height * 0.66, canvas.width, canvas.height * 0.22);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createRingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  [
    [0, "rgba(120,160,220,0)"],
    [0.12, "rgba(130,170,230,0.12)"],
    [0.2, "rgba(160,205,255,0.36)"],
    [0.28, "rgba(70,95,145,0.06)"],
    [0.39, "rgba(180,220,255,0.28)"],
    [0.5, "rgba(70,95,145,0.03)"],
    [0.62, "rgba(160,205,255,0.24)"],
    [0.76, "rgba(120,160,220,0.14)"],
    [1, "rgba(120,160,220,0)"],
  ].forEach(([stop, color]) => gradient.addColorStop(stop, color));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 6000; i += 1) {
    ctx.fillStyle = `rgba(180,220,255,${Math.random() * 0.22})`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 1);
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
        float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
        vec3 color = mix(vec3(0.18, 0.46, 1.0), vec3(0.52, 0.9, 1.0), fresnel);
        gl_FragColor = vec4(color, fresnel * 0.45);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    transparent: true,
  });
}

function NeptuneScene({ isPaused, onPausedChange, showAtmosphere = true, showRings = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000004);
    scene.fog = new THREE.FogExp2(0x00000a, 0.000018);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.6, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    const releaseInteractionLock = lockSceneInteraction(container, renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.34;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 2.9;
    controls.maxDistance = 22;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enablePan = false;

    scene.add(createStars());
    scene.add(new THREE.AmbientLight(0x081433, 0.9));
    const sun = new THREE.DirectionalLight(0xe8f4ff, 3.8);
    sun.position.set(9, 4, 8);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x2c70ff, 1.2);
    fill.position.set(-5, -1, -6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x76d8ff, 1.6);
    rim.position.set(0, -2, -8);
    scene.add(rim);

    const neptuneTexture = createNeptuneTexture();
    const neptuneGroup = new THREE.Group();
    const neptune = new THREE.Mesh(
      new THREE.SphereGeometry(1.82, 224, 224),
      new THREE.MeshStandardMaterial({
        map: neptuneTexture,
        roughness: 0.5,
        metalness: 0.02,
      }),
    );
    neptuneGroup.add(neptune);

    const atmosphereMaterial = createAtmosphereMaterial();
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.9, 160, 160), atmosphereMaterial);
    neptuneGroup.add(atmosphere);

    const ringTexture = createRingTexture();
    const ringGeometry = new THREE.RingGeometry(2.32, 3.95, 256);
    const position = ringGeometry.attributes.position;
    const uv = ringGeometry.attributes.uv;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const distance = Math.sqrt(x * x + y * y);
      uv.setXY(i, (distance - 2.32) / (3.95 - 2.32), 0.5);
    }
    const rings = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    rings.rotation.x = Math.PI / 2 + 0.22;
    rings.rotation.z = -0.06;
    neptuneGroup.add(rings);
    scene.add(neptuneGroup);

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
      rings.visible = showRings;
      atmosphereMaterial.uniforms.cameraPositionWorld.value.copy(camera.position);

      if (!isPaused) {
        neptune.rotation.y += 0.00052;
        atmosphere.rotation.y += 0.00018;
        rings.rotation.z += 0.00018;
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
      neptuneTexture.dispose();
      ringTexture.dispose();
      renderer.dispose();
      releaseInteractionLock();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showAtmosphere, showRings]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default NeptuneScene;
