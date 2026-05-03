import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createStars() {
  const count = 8000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 50 + Math.random() * 150;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;

    const warm = Math.random();
    colors[i * 3] = 1;
    colors[i * 3 + 1] = warm > 0.55 ? 0.78 : 0.94;
    colors[i * 3 + 2] = warm > 0.72 ? 0.56 : 0.9;
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
      transparent: true,
      opacity: 0.9,
    }),
  );
}

function createSolarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  const base = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
  );
  [
    [0, "#fffff0"],
    [0.12, "#fff4a8"],
    [0.34, "#ffd21e"],
    [0.62, "#ff9a12"],
    [0.86, "#ff6b1a"],
    [1, "#ff4936"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 15000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 5 + 1;
    const tone = Math.random();
    ctx.fillStyle =
      tone < 0.4
        ? `rgba(255,255,210,${Math.random() * 0.4})`
        : tone < 0.7
          ? `rgba(255,200,50,${Math.random() * 0.35})`
          : `rgba(255,115,0,${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 15; i += 1) {
    const x = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
    const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
    const radius = Math.random() * 40 + 15;

    const spot = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    spot.addColorStop(0, "rgba(45,25,10,0.9)");
    spot.addColorStop(0.45, "rgba(90,48,18,0.72)");
    spot.addColorStop(0.72, "rgba(145,88,30,0.38)");
    spot.addColorStop(1, "rgba(255,180,50,0)");
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    const penumbra = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.55);
    penumbra.addColorStop(0, "rgba(200,150,50,0.45)");
    penumbra.addColorStop(1, "rgba(255,200,100,0)");
    ctx.fillStyle = penumbra;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.55, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 36; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = Math.random() * 120 + 35;
    const angle = Math.random() * Math.PI;

    ctx.strokeStyle = `rgba(255,215,120,${Math.random() * 0.22})`;
    ctx.lineWidth = Math.random() * 2 + 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * length * 0.5,
      y + Math.sin(angle) * length * 0.5 + (Math.random() - 0.5) * 28,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length,
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createGlowMaterial(color, power, intensity) {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      power: { value: power },
      intensity: { value: intensity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float power;
      uniform float intensity;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float rim = pow(1.0 - max(dot(vNormal, viewDir), 0.0), power);
        gl_FragColor = vec4(glowColor, rim * intensity);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false,
  });
}

function directionFromIndex(index, total, radius) {
  const theta = (index / total) * Math.PI * 2;
  const y = Math.sin(theta * 2.3) * 0.55;
  const flatRadius = Math.sqrt(Math.max(radius * radius - y * y, 0));
  return new THREE.Vector3(Math.cos(theta) * flatRadius, y, Math.sin(theta) * flatRadius).normalize();
}

function orientAlongDirection(object, direction) {
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
}

function createCoronaSpike(index, total) {
  const direction = directionFromIndex(index, total, 1);
  const height = 0.9 + Math.random() * 2.4;
  const width = 0.04 + Math.random() * 0.16;
  const geometry = new THREE.ConeGeometry(width, height, 8, 1, true);
  geometry.translate(0, height / 2, 0);

  const material = new THREE.MeshBasicMaterial({
    color: 0xffe4a5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.18 + Math.random() * 0.18,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const spike = new THREE.Mesh(geometry, material);
  spike.position.copy(direction.clone().multiplyScalar(2.02));
  orientAlongDirection(spike, direction);
  spike.userData = {
    baseScale: 1,
    phase: Math.random() * Math.PI * 2,
    speed: 0.45 + Math.random() * 1.35,
  };
  return spike;
}

function createProminence(index, total) {
  const direction = directionFromIndex(index, total, 1);
  const tangent = new THREE.Vector3(-direction.z, 0.25 + Math.random() * 0.2, direction.x).normalize();
  const size = 0.35 + Math.random() * 1.05;
  const start = direction.clone().multiplyScalar(2.08);
  const control = direction.clone().multiplyScalar(2.35 + size).add(tangent.clone().multiplyScalar(size * 0.55));
  const end = direction.clone().multiplyScalar(2.15 + size * 0.45).add(tangent.clone().multiplyScalar(size * 0.95));
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);

  const material = new THREE.LineBasicMaterial({
    color: 0xff4b1f,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(56)), material);
  line.userData = {
    phase: Math.random() * Math.PI * 2,
    speed: 0.35 + Math.random() * 0.8,
    baseOpacity: material.opacity,
  };
  return line;
}

function createSolarWind() {
  const count = 650;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = [];

  for (let i = 0; i < count; i += 1) {
    const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const radius = 2.12 + Math.random() * 3.1;
    positions[i * 3] = direction.x * radius;
    positions[i * 3 + 1] = direction.y * radius;
    positions[i * 3 + 2] = direction.z * radius;
    seeds.push({ direction, radius, speed: 0.003 + Math.random() * 0.006 });
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffa51f,
      size: 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.6,
    }),
  );
  points.userData.seeds = seeds;
  return points;
}

const layerStyles = {
  core: { color: 0xffffff, scale: 0.42, opacity: 0.32 },
  radiative: { color: 0xffd84a, scale: 0.86, opacity: 0.2 },
  convective: { color: 0xff7b22, scale: 1.14, opacity: 0.18 },
  photosphere: { color: 0xffc233, scale: 1.02, opacity: 0.16 },
  chromosphere: { color: 0xff3755, scale: 1.1, opacity: 0.2 },
  corona: { color: 0xffefd1, scale: 1.55, opacity: 0.16 },
};

function SunScene({ isPaused, onPausedChange, showCorona = true, showFlares = true, selectedLayer = "photosphere" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.000008);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.15;
    controls.target.set(0, 0, 0);

    scene.add(createStars());
    scene.add(new THREE.AmbientLight(0xff7a18, 1.15));
    const pointLight = new THREE.PointLight(0xffb22d, 38, 95, 1.6);
    scene.add(pointLight);

    const sunGroup = new THREE.Group();
    const solarTexture = createSolarTexture();
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2, 256, 256),
      new THREE.MeshBasicMaterial({ map: solarTexture }),
    );
    sunGroup.add(sunMesh);

    const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(2.08, 128, 128), createGlowMaterial(0xff9a16, 2.1, 1.1));
    sunGroup.add(glowMesh);

    const layerMaterial = new THREE.MeshBasicMaterial({
      color: layerStyles[selectedLayer]?.color ?? 0xffc233,
      transparent: true,
      opacity: layerStyles[selectedLayer]?.opacity ?? 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      wireframe: true,
    });
    const layerFocus = new THREE.Mesh(new THREE.SphereGeometry(2, 96, 96), layerMaterial);
    layerFocus.scale.setScalar(layerStyles[selectedLayer]?.scale ?? 1.02);
    sunGroup.add(layerFocus);
    scene.add(sunGroup);

    const coronaGroup = new THREE.Group();
    const coronaSpikes = Array.from({ length: 48 }, (_, index) => createCoronaSpike(index, 48));
    coronaSpikes.forEach((spike) => coronaGroup.add(spike));
    scene.add(coronaGroup);

    const prominencesGroup = new THREE.Group();
    const prominences = Array.from({ length: 14 }, (_, index) => createProminence(index, 14));
    prominences.forEach((prominence) => prominencesGroup.add(prominence));
    scene.add(prominencesGroup);

    const solarWind = createSolarWind();
    scene.add(solarWind);

    const handleDoubleClick = () => onPausedChange?.(!isPaused);
    renderer.domElement.addEventListener("dblclick", handleDoubleClick);

    let frameId;
    const clock = new THREE.Clock();
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
      coronaGroup.visible = showCorona;
      prominencesGroup.visible = showFlares;
      solarWind.visible = showFlares;

      const layerStyle = layerStyles[selectedLayer] ?? layerStyles.photosphere;
      layerMaterial.color.setHex(layerStyle.color);
      layerMaterial.opacity = layerStyle.opacity + Math.sin(time * 2.2) * 0.035;
      layerFocus.scale.setScalar(layerStyle.scale + Math.sin(time * 1.7) * 0.015);

      if (!isPaused) {
        sunMesh.rotation.y += 0.00045;
        glowMesh.scale.setScalar(1 + Math.sin(time * 2) * 0.01);
        coronaGroup.rotation.y += 0.00035;
        prominencesGroup.rotation.y += 0.00042;
        solarWind.rotation.y += 0.0002;
        solarWind.rotation.x += 0.00012;
        solarWind.material.opacity = 0.42 + Math.sin(time * 1.5) * 0.18;

        coronaSpikes.forEach((spike) => {
          const variation = Math.sin(time * spike.userData.speed + spike.userData.phase) * 0.18;
          spike.scale.y = spike.userData.baseScale + variation;
          spike.material.opacity = 0.18 + Math.max(variation, 0) * 0.9;
        });

        prominences.forEach((prominence) => {
          prominence.material.opacity =
            prominence.userData.baseOpacity + Math.sin(time * prominence.userData.speed + prominence.userData.phase) * 0.2;
        });

        const positions = solarWind.geometry.attributes.position;
        solarWind.userData.seeds.forEach((particle, index) => {
          particle.radius += particle.speed;
          if (particle.radius > 5.4) particle.radius = 2.12;
          positions.setXYZ(
            index,
            particle.direction.x * particle.radius,
            particle.direction.y * particle.radius,
            particle.direction.z * particle.radius,
          );
        });
        positions.needsUpdate = true;
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
      solarTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, selectedLayer, showCorona, showFlares]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default SunScene;
