import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";
import saturnMoons from "../data/saturnMoons";

function createSaturnTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  [
    [0, "#f5e6d3"],
    [0.12, "#d9c3a2"],
    [0.25, "#b99a70"],
    [0.38, "#ead6b6"],
    [0.5, "#c3a781"],
    [0.64, "#e8d5b7"],
    [0.78, "#b79366"],
    [1, "#ede0cc"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const turbulence = Math.sin(y * 0.011) + Math.sin(y * 0.031) * 0.35;
    ctx.fillStyle = `rgba(150,125,96,${0.05 + Math.abs(turbulence) * 0.16})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 5200; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 6 + 0.5;
    ctx.fillStyle =
      Math.random() > 0.5
        ? `rgba(230,210,180,${Math.random() * 0.25})`
        : `rgba(130,105,82,${Math.random() * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 2.3, radius * 0.45, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createRingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

  [
    [0, "rgba(180,160,140,0)"],
    [0.12, "rgba(190,170,150,0.18)"],
    [0.22, "rgba(225,205,178,0.62)"],
    [0.36, "rgba(245,224,196,0.82)"],
    [0.48, "rgba(70,58,48,0.03)"],
    [0.52, "rgba(70,58,48,0.02)"],
    [0.58, "rgba(220,200,175,0.55)"],
    [0.72, "rgba(200,180,155,0.42)"],
    [0.84, "rgba(180,160,140,0.14)"],
    [1, "rgba(160,140,120,0)"],
  ].forEach(([stop, color]) => gradient.addColorStop(stop, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 14000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = `rgba(${200 + Math.random() * 55},${180 + Math.random() * 40},${150 + Math.random() * 30},${Math.random() * 0.28})`;
    ctx.fillRect(x, y, Math.random() * 3, Math.random() * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMoonTexture(color) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 800; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 2.2;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStars() {
  const count = 6000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 45 + Math.random() * 120;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;
    const warm = Math.random();
    colors[i * 3] = warm < 0.2 ? 0.65 : 1;
    colors[i * 3 + 1] = warm < 0.65 ? 0.8 : 0.95;
    colors[i * 3 + 2] = warm < 0.2 ? 1 : 0.65;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.86,
    }),
  );
}

function SaturnScene({ isPaused, onPausedChange, showRings = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000010);
    scene.fog = new THREE.FogExp2(0x000015, 0.000025);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 3, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);
    const releaseInteractionLock = lockSceneInteraction(container, renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.35;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 3.5;
    controls.maxDistance = 35;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);

    scene.add(createStars());
    scene.add(new THREE.AmbientLight(0x0a0a20, 0.5));
    const sun = new THREE.DirectionalLight(0xfff8f0, 3.0);
    sun.position.set(10, 4, 12);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x887766, 0.8);
    rim.position.set(0, -1, -8);
    scene.add(rim);

    const saturnGroup = new THREE.Group();
    const saturnTexture = createSaturnTexture();
    const saturnMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 256, 256),
      new THREE.MeshStandardMaterial({ map: saturnTexture, roughness: 0.7, metalness: 0.03 }),
    );
    saturnGroup.add(saturnMesh);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.88, 128, 128),
      new THREE.MeshBasicMaterial({
        color: 0xe8d5b7,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    saturnGroup.add(atmosphere);

    const ringTexture = createRingTexture();
    const ringGeometry = new THREE.RingGeometry(2.1, 4.0, 256);
    const position = ringGeometry.attributes.position;
    const uv = ringGeometry.attributes.uv;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const distance = Math.sqrt(x * x + y * y);
      uv.setXY(i, (distance - 2.1) / (4.0 - 2.1), 0.5);
    }
    const rings = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshStandardMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.86,
        roughness: 0.6,
        metalness: 0.05,
      }),
    );
    rings.rotation.x = Math.PI / 2 + 0.47;
    saturnGroup.add(rings);
    scene.add(saturnGroup);

    const moonTextures = [];
    const moons = saturnMoons.map((moon, index) => {
      const orbit = new THREE.Group();
      orbit.rotation.y = (index / saturnMoons.length) * Math.PI * 2;

      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 257 }, (_, pointIndex) => {
            const angle = (pointIndex / 256) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(angle) * moon.distance, 0, Math.sin(angle) * moon.distance);
          }),
        ),
        new THREE.LineBasicMaterial({ color: 0x445566, transparent: true, opacity: 0.24 }),
      );
      scene.add(orbitLine);

      const texture = createMoonTexture(moon.color);
      moonTextures.push(texture);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(moon.size, 48, 48),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.75 }),
      );
      mesh.position.set(moon.distance, 0, 0);
      orbit.add(mesh);
      scene.add(orbit);
      return { orbit, mesh, speed: moon.speed };
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
      rings.visible = showRings;
      if (!isPaused) {
        saturnMesh.rotation.y += 0.0008;
        rings.rotation.z += 0.0005;
        moons.forEach((moon) => {
          moon.orbit.rotation.y += moon.speed;
          moon.mesh.rotation.y += 0.003;
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
      saturnTexture.dispose();
      ringTexture.dispose();
      moonTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      releaseInteractionLock();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showRings]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default SaturnScene;
