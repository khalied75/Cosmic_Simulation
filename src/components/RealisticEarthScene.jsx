import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

const EARTH_MAP = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_BUMP = "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg";
const CLOUD_MAP = "https://threejs.org/examples/textures/planets/earth_clouds_1024.png";

const cities = [
  { lat: 31.9539, lon: 35.9106, ar: "عمّان", en: "Amman", color: "#aaddff" },
  { lat: 30.0444, lon: 31.2357, ar: "القاهرة", en: "Cairo", color: "#aaffaa" },
  { lat: 25.2048, lon: 55.2708, ar: "دبي", en: "Dubai", color: "#aaccff" },
  { lat: 51.5074, lon: -0.1278, ar: "لندن", en: "London", color: "#ffaaaa" },
  { lat: 35.6895, lon: 139.6917, ar: "طوكيو", en: "Tokyo", color: "#ffaaaa" },
  { lat: 40.7128, lon: -74.006, ar: "نيويورك", en: "New York", color: "#ffaaaa" },
];

function createLabel(lat, lon, text, color) {
  const radius = 1.88;
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  const labelElement = document.createElement("div");
  labelElement.textContent = text;
  labelElement.className = "earth-label";
  labelElement.style.color = color;

  const label = new CSS2DObject(labelElement);
  label.position.set(x, y, z);
  return label;
}

function createStarSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(220,235,255,0.8)");
  gradient.addColorStop(0.72, "rgba(160,190,255,0.25)");
  gradient.addColorStop(1, "rgba(160,190,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStars(count, minRadius, spread, color, size, opacity) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const starSprite = createStarSprite();

  for (let i = 0; i < count; i += 1) {
    const radius = minRadius + Math.random() * spread;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.asin(Math.random() * 2 - 1);
    positions[i * 3] = Math.cos(theta) * Math.cos(phi) * radius;
    positions[i * 3 + 1] = Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color,
      map: starSprite,
      size: Math.max(1, size * 5),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity,
      alphaTest: 0.08,
      sizeAttenuation: false,
    }),
  );
}

function createMoonTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, "#d8d8d0");
  base.addColorStop(0.45, "#8f8f88");
  base.addColorStop(1, "#c4c0b7");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 2200; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 3 + 0.3;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.16)" : "rgba(30,30,30,0.18)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 38; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 14 + 3;
    const crater = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
    crater.addColorStop(0, "rgba(45,45,45,0.55)");
    crater.addColorStop(0.58, "rgba(115,115,110,0.28)");
    crater.addColorStop(1, "rgba(230,230,220,0)");
    ctx.fillStyle = crater;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(235,235,225,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function RealisticEarthScene({ language = "AR", onAutoRotateChange }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x0a0a1a);
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.className = "earth-label-layer";
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.inset = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    container.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.5;
    controls.minDistance = 1.8;
    controls.maxDistance = 18;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);
    controls.update();

    const stars = createStars(2600, 95, 120, 0xf4f7ff, 0.32, 0.95);
    const closeStars = createStars(850, 75, 90, 0xffffff, 0.2, 0.86);
    scene.add(stars, closeStars);

    const earthGroup = new THREE.Group();
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const earthTexture = loader.load(EARTH_MAP);
    const bumpTexture = loader.load(EARTH_BUMP);
    const cloudTexture = loader.load(CLOUD_MAP);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.colorSpace = THREE.SRGBColorSpace;

    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 128, 128),
      new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.05,
        specular: new THREE.Color("grey"),
        shininess: 10,
      }),
    );
    earthGroup.add(earthMesh);

    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.81, 128, 128),
      new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    );
    earthGroup.add(cloudMesh);

    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.83, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.08,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    earthGroup.add(atmosphereMesh);

    cities.forEach((city) => {
      earthGroup.add(
        createLabel(city.lat, city.lon, language === "AR" ? city.ar : city.en, city.color),
      );
    });

    scene.add(earthGroup);

    const moonTexture = createMoonTexture();
    const moonOrbitGroup = new THREE.Group();
    moonOrbitGroup.rotation.x = 0.22;
    moonOrbitGroup.rotation.z = -0.12;

    const moonDistance = 7.2;
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 96, 96),
      new THREE.MeshStandardMaterial({
        map: moonTexture,
        bumpMap: moonTexture,
        bumpScale: 0.012,
        roughness: 0.92,
        metalness: 0.0,
      }),
    );
    moonMesh.position.set(moonDistance, 0, 0);
    moonOrbitGroup.add(moonMesh);
    scene.add(moonOrbitGroup);

    const moonOrbitLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 257 }, (_, index) => {
          const angle = (index / 256) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle) * moonDistance, 0, Math.sin(angle) * moonDistance);
        }),
      ),
      new THREE.LineBasicMaterial({
        color: 0x9fb7ff,
        transparent: true,
        opacity: 0.12,
      }),
    );
    moonOrbitLine.rotation.copy(moonOrbitGroup.rotation);
    scene.add(moonOrbitLine);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(10, 5, 15);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x334466);
    scene.add(ambientLight);

    const backLight = new THREE.DirectionalLight(0x446688, 0.6);
    backLight.position.set(-8, -2, -8);
    scene.add(backLight);

    const fillLight = new THREE.DirectionalLight(0x8899cc, 0.5);
    fillLight.position.set(-5, 3, -10);
    scene.add(fillLight);

    const handleDoubleClick = () => {
      controls.autoRotate = !controls.autoRotate;
      onAutoRotateChange?.(controls.autoRotate);
    };
    renderer.domElement.addEventListener("dblclick", handleDoubleClick);

    let frameId;
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      labelRenderer.setSize(clientWidth, clientHeight);
    };

    const animate = () => {
      controls.update();
      if (controls.autoRotate) {
        earthGroup.rotation.y += 0.0016;
        moonOrbitGroup.rotation.y += 0.00115;
      }
      cloudMesh.rotation.y += 0.00035;
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
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
      earthTexture.dispose();
      bumpTexture.dispose();
      cloudTexture.dispose();
      moonTexture.dispose();
      earthMesh.material.dispose();
      earthMesh.geometry.dispose();
      moonMesh.material.dispose();
      moonMesh.geometry.dispose();
      moonOrbitLine.material.dispose();
      moonOrbitLine.geometry.dispose();
      cloudMesh.material.dispose();
      cloudMesh.geometry.dispose();
      atmosphereMesh.material.dispose();
      atmosphereMesh.geometry.dispose();
      stars.geometry.dispose();
      stars.material.map?.dispose();
      stars.material.dispose();
      closeStars.geometry.dispose();
      closeStars.material.map?.dispose();
      closeStars.material.dispose();
      renderer.dispose();
      labelRenderer.domElement.remove();
      renderer.domElement.remove();
    };
  }, [language, onAutoRotateChange]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default RealisticEarthScene;
