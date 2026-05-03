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

function createStars(count, minRadius, spread, color, size, opacity) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

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
      size,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity,
    }),
  );
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
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);
    controls.update();

    const stars = createStars(2000, 40, 60, 0xffffff, 0.25, 0.9);
    const closeStars = createStars(800, 15, 25, 0xaaccff, 0.15, 0.8);
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
      earthMesh.material.dispose();
      earthMesh.geometry.dispose();
      cloudMesh.material.dispose();
      cloudMesh.geometry.dispose();
      atmosphereMesh.material.dispose();
      atmosphereMesh.geometry.dispose();
      stars.geometry.dispose();
      stars.material.dispose();
      closeStars.geometry.dispose();
      closeStars.material.dispose();
      renderer.dispose();
      labelRenderer.domElement.remove();
      renderer.domElement.remove();
    };
  }, [language, onAutoRotateChange]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default RealisticEarthScene;
