import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";
import jupiterMoons from "../data/jupiterMoons";

function createJupiterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  [
    [0, "#e9d2ad"],
    [0.08, "#b98555"],
    [0.16, "#ead4b4"],
    [0.25, "#9f5b2a"],
    [0.35, "#d0995d"],
    [0.46, "#6f3a1d"],
    [0.56, "#c57936"],
    [0.67, "#f0d9b9"],
    [0.78, "#a8612b"],
    [0.9, "#d5ae80"],
    [1, "#f2dfbf"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const wave = Math.sin(y * 0.018) + Math.sin(y * 0.043) * 0.45;
    ctx.fillStyle = `rgba(${wave > 0 ? "255,230,190" : "95,48,24"},${0.06 + Math.abs(wave) * 0.12})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 9500; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 10 + 0.8;
    const warm = Math.random();
    ctx.fillStyle =
      warm < 0.35
        ? `rgba(235,196,139,${Math.random() * 0.45})`
        : warm < 0.7
          ? `rgba(120,61,28,${Math.random() * 0.34})`
          : `rgba(255,235,198,${Math.random() * 0.28})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * (1.5 + Math.random() * 2.5), radius * 0.45, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const spotX = canvas.width * 0.38;
  const spotY = canvas.height * 0.55;
  const spot = ctx.createRadialGradient(spotX, spotY, 12, spotX, spotY, 245);
  spot.addColorStop(0, "#ff7252");
  spot.addColorStop(0.25, "#cf3528");
  spot.addColorStop(0.55, "#8f221c");
  spot.addColorStop(0.86, "#b66a3c");
  spot.addColorStop(1, "rgba(210,133,75,0)");
  ctx.fillStyle = spot;
  ctx.beginPath();
  ctx.ellipse(spotX, spotY, 240, 118, -0.04, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createMoonTexture(color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 1600; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 4 + 0.4;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStars() {
  const count = 5000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 42 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;
    const warm = Math.random();
    colors[i * 3] = warm < 0.2 ? 0.65 : 1;
    colors[i * 3 + 1] = warm < 0.65 ? 0.78 : 0.92;
    colors[i * 3 + 2] = warm < 0.2 ? 1 : 0.64;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
    }),
  );
}

function JupiterScene({ isPaused, onPausedChange }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000008);
    scene.fog = new THREE.FogExp2(0x000012, 0.00003);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 2, 8.5);

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
    controls.rotateSpeed = 0.35;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 3.2;
    controls.maxDistance = 30;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);

    scene.add(createStars());
    scene.add(new THREE.AmbientLight(0x0a0a20, 0.65));
    const sun = new THREE.DirectionalLight(0xfff5e8, 3.5);
    sun.position.set(12, 5, 10);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x886644, 1.2);
    rim.position.set(0, -1, -8);
    scene.add(rim);

    const jupiterGroup = new THREE.Group();
    const jupiterTexture = createJupiterTexture();
    const jupiterMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2, 256, 256),
      new THREE.MeshStandardMaterial({ map: jupiterTexture, roughness: 0.65, metalness: 0.04 }),
    );
    jupiterGroup.add(jupiterMesh);

    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.025, 192, 192),
      new THREE.MeshStandardMaterial({
        color: 0xffead0,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    jupiterGroup.add(cloudMesh);
    scene.add(jupiterGroup);

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x887766,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    });
    const rings = new THREE.Mesh(new THREE.TorusGeometry(2.52, 0.08, 16, 220), ringMaterial);
    rings.rotation.x = Math.PI / 2 + 0.05;
    scene.add(rings);

    const moonTextures = [];
    const moons = jupiterMoons.map((moon, index) => {
      const orbit = new THREE.Group();
      orbit.rotation.x = moon.tilt;
      orbit.rotation.y = (index / jupiterMoons.length) * Math.PI * 2;

      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 257 }, (_, pointIndex) => {
            const angle = (pointIndex / 256) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(angle) * moon.distance, 0, Math.sin(angle) * moon.distance);
          }),
        ),
        new THREE.LineBasicMaterial({ color: 0x4f5b6c, transparent: true, opacity: 0.28 }),
      );
      scene.add(orbitLine);

      const moonTexture = createMoonTexture(moon.color);
      moonTextures.push(moonTexture);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(moon.size, 64, 64),
        new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 0.78 }),
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
      if (!isPaused) {
        jupiterMesh.rotation.y += 0.0012;
        cloudMesh.rotation.y += 0.0018;
        rings.rotation.y += 0.0001;
        moons.forEach((moon) => {
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
      jupiterTexture.dispose();
      moonTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      releaseInteractionLock();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default JupiterScene;
