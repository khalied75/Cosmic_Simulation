import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";
import { createSpacetimeFabric, fabricPresets } from "./spacetimeFabric3d";
import { useSpacetimeFabric } from "./spacetimeFabricState";

function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(170,220,255,0.78)");
  gradient.addColorStop(1, "rgba(170,220,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStars() {
  const count = 9200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 90 + Math.random() * 560;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const tone = Math.random();
    colors[i * 3] = tone < 0.18 ? 0.75 : 1;
    colors[i * 3 + 1] = tone < 0.5 ? 0.88 : 0.96;
    colors[i * 3 + 2] = 1;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const starTexture = createStarTexture();

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: starTexture,
      size: 2.1,
      sizeAttenuation: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.94,
      alphaTest: 0.08,
    }),
  );
  points.userData.starTexture = starTexture;
  return points;
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(256, 256, 12, 256, 256, 256);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.15, "rgba(120,220,255,0.95)");
  gradient.addColorStop(0.36, "rgba(72,130,255,0.55)");
  gradient.addColorStop(0.58, "rgba(146,77,255,0.24)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMagnetarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  [
    [0, "#f4fcff"],
    [0.2, "#bce7ff"],
    [0.4, "#79c6ff"],
    [0.6, "#6172ff"],
    [0.8, "#bce7ff"],
    [1, "#f7fbff"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const band = Math.sin(y * 0.03) + Math.sin(y * 0.075) * 0.45;
    ctx.fillStyle = band > 0 ? `rgba(255,255,255,${0.04 + band * 0.06})` : `rgba(55,80,255,${0.04 + Math.abs(band) * 0.07})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 3200; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 4 + 0.2;
    ctx.fillStyle = Math.random() > 0.45 ? "rgba(255,255,255,0.16)" : "rgba(82,95,255,0.18)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFieldLine(radiusScale, rotationY, color, opacity) {
  const points = [];
  for (let i = 0; i <= 120; i += 1) {
    const t = -Math.PI * 0.86 + (i / 120) * Math.PI * 1.72;
    const sin = Math.sin(t);
    const cos = Math.cos(t);
    const r = radiusScale * (1 + 1.85 * sin * sin);
    points.push(new THREE.Vector3(r * sin, r * cos, 0));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.rotation.y = rotationY;
  line.userData.baseOpacity = opacity;
  return line;
}

function createJet(texture, color, side) {
  const group = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color,
        transparent: true,
        opacity: 0.1 + i * 0.035,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    sprite.scale.set(0.9 + i * 0.22, 3.6 + i * 1.45, 1);
    sprite.position.y = side * (1.15 + i * 0.95);
    group.add(sprite);
  }
  return group;
}

function createBurstParticles() {
  const count = 520;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds = [];

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 1.05 + Math.random() * 1.8;
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.cos(phi) * radius;
    positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * radius;
    speeds.push(0.002 + Math.random() * 0.0045);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xb8e8ff,
    size: 0.045,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.78,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.speeds = speeds;
  return points;
}

function MagnetarScene({ isPaused, onPausedChange, showFields = true, showJets = true, showBurst = true }) {
  const containerRef = useRef(null);
  const showSpacetimeFabric = useSpacetimeFabric("magnetar");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02030c);
    scene.fog = new THREE.FogExp2(0x02030c, 0.008);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1200);
    camera.position.set(0, 4.8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;
    container.appendChild(renderer.domElement);
    const releaseInteractionLock = lockSceneInteraction(container, renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5.5;
    controls.maxDistance = 44;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.24;
    controls.enablePan = false;

    const stars = createStars();
    scene.add(stars);

    const fabric = createSpacetimeFabric(fabricPresets.magnetar);
    fabric.group.visible = showSpacetimeFabric;
    scene.add(fabric.group);

    scene.add(new THREE.AmbientLight(0x243458, 0.5));
    const coldLight = new THREE.PointLight(0x86d9ff, 7.5, 90, 1.5);
    coldLight.position.set(0, 0, 0);
    scene.add(coldLight);
    const violetLight = new THREE.PointLight(0x8b66ff, 2.4, 110, 1.8);
    violetLight.position.set(0, 3, -8);
    scene.add(violetLight);

    const magnetarGroup = new THREE.Group();
    scene.add(magnetarGroup);

    const surfaceTexture = createMagnetarTexture();
    const magnetar = new THREE.Mesh(
      new THREE.SphereGeometry(1.28, 144, 144),
      new THREE.MeshStandardMaterial({
        map: surfaceTexture,
        roughness: 0.32,
        metalness: 0.03,
        emissive: 0x1d2eff,
        emissiveIntensity: 0.35,
      }),
    );
    magnetarGroup.add(magnetar);

    const glowTexture = createGlowTexture();
    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x9fe8ff,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    coreGlow.scale.set(7.5, 7.5, 1);
    magnetarGroup.add(coreGlow);

    const haloGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x7a59ff,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    haloGlow.scale.set(13.5, 13.5, 1);
    magnetarGroup.add(haloGlow);

    const fieldLines = new THREE.Group();
    const lineConfigs = [
      [2.35, 0, 0x79d7ff, 0.58],
      [2.8, Math.PI / 3, 0xb18cff, 0.36],
      [3.2, Math.PI / 1.5, 0x79d7ff, 0.28],
      [3.7, Math.PI / 2.15, 0xc9b8ff, 0.22],
    ];
    lineConfigs.forEach(([radiusScale, rotationY, color, opacity]) => {
      fieldLines.add(createFieldLine(radiusScale, rotationY, color, opacity));
    });
    magnetarGroup.add(fieldLines);

    const jets = new THREE.Group();
    jets.add(createJet(glowTexture, 0xa8e7ff, 1));
    jets.add(createJet(glowTexture, 0x8d6bff, -1));
    magnetarGroup.add(jets);

    const burstParticles = createBurstParticles();
    magnetarGroup.add(burstParticles);

    const handleDoubleClick = () => onPausedChange?.(!isPaused);
    renderer.domElement.addEventListener("dblclick", handleDoubleClick);

    const clock = new THREE.Clock();
    let animationId;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    const animate = () => {
      const time = clock.getElapsedTime();
      controls.autoRotate = !isPaused;
      controls.update();
      fieldLines.visible = showFields;
      jets.visible = showJets;
      burstParticles.visible = showBurst;

      if (!isPaused) {
        magnetar.rotation.y += 0.01;
        magnetar.rotation.z = Math.sin(time * 0.7) * 0.08;
        fieldLines.rotation.y += 0.0055;
        fieldLines.rotation.z = Math.sin(time * 0.9) * 0.14;
        jets.rotation.y += 0.0075;
        coreGlow.material.opacity = 0.78 + Math.sin(time * 5.6) * 0.14;
        haloGlow.material.opacity = 0.18 + Math.sin(time * 1.8) * 0.06;

        fieldLines.children.forEach((line, index) => {
          line.material.opacity = line.userData.baseOpacity + Math.sin(time * (1.2 + index * 0.35)) * 0.08;
        });

        const positions = burstParticles.geometry.attributes.position;
        burstParticles.userData.speeds.forEach((speed, index) => {
          const x = positions.getX(index);
          const y = positions.getY(index);
          const z = positions.getZ(index);
          const vector = new THREE.Vector3(x, y, z);
          vector.normalize().multiplyScalar(speed);
          positions.setXYZ(index, x + vector.x, y + vector.y, z + vector.z);

          const radius = Math.sqrt(
            positions.getX(index) * positions.getX(index) +
              positions.getY(index) * positions.getY(index) +
              positions.getZ(index) * positions.getZ(index),
          );
          if (radius > 4.8) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const resetRadius = 1.05 + Math.random() * 1.7;
            positions.setXYZ(
              index,
              Math.cos(theta) * Math.sin(phi) * resetRadius,
              Math.cos(phi) * resetRadius,
              Math.sin(theta) * Math.sin(phi) * resetRadius,
            );
          }
        });
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      controls.dispose();
      fabric.dispose();
      stars.geometry.dispose();
      stars.material.map?.dispose();
      stars.material.dispose();
      surfaceTexture.dispose();
      glowTexture.dispose();
      magnetar.geometry.dispose();
      magnetar.material.dispose();
      coreGlow.material.dispose();
      haloGlow.material.dispose();
      fieldLines.children.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      jets.children.forEach((jetGroup) => {
        jetGroup.children.forEach((sprite) => sprite.material.dispose());
      });
      burstParticles.geometry.dispose();
      burstParticles.material.dispose();
      renderer.dispose();
      releaseInteractionLock();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showFields, showJets, showBurst, showSpacetimeFabric]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default MagnetarScene;
