import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";
import { createSpacetimeFabric, fabricPresets } from "./spacetimeFabric3d";
import { useSpacetimeFabric } from "./spacetimeFabricState";

function starColor(t) {
  const colors = [
    [0.6, 0.75, 1.0],
    [0.85, 0.9, 1.0],
    [1.0, 0.97, 0.85],
    [1.0, 0.9, 0.6],
    [1.0, 0.7, 0.35],
    [1.0, 0.4, 0.15],
  ];
  const index = t * (colors.length - 1);
  const base = Math.floor(index);
  const blend = index - base;
  const a = colors[Math.min(base, colors.length - 1)];
  const b = colors[Math.min(base + 1, colors.length - 1)];

  return [
    a[0] * (1 - blend) + b[0] * blend,
    a[1] * (1 - blend) + b[1] * blend,
    a[2] * (1 - blend) + b[2] * blend,
  ];
}

function makeStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSoftCircle(falloff) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(falloff, "rgba(255,255,255,0.5)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
  gradient.addColorStop(0, "rgba(255,240,180,0.9)");
  gradient.addColorStop(0.1, "rgba(255,200,100,0.7)");
  gradient.addColorStop(0.3, "rgba(220,140,60,0.4)");
  gradient.addColorStop(0.6, "rgba(150,80,20,0.15)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildGalaxy(scene, params) {
  const starTexture = makeStarTexture();
  const positions = new Float32Array(params.starCount * 3);
  const colors = new Float32Array(params.starCount * 3);
  const sizes = new Float32Array(params.starCount);

  const ARMS = 4;
  const ARM_TWIST = 3.5;
  const DISK_HEIGHT = 28;
  const DISK_RADIUS = 500;
  const BAR_LEN = 140;
  const BAR_WIDTH = 45;

  for (let i = 0; i < params.starCount; i += 1) {
    let x;
    let y;
    let z;
    let r;
    const roll = Math.random();

    if (roll < 0.15) {
      const u = Math.random();
      const v = Math.random();
      const theta = Math.acos(2 * v - 1);
      const phi = 2 * Math.PI * u;
      r = Math.cbrt(Math.random()) * 120;
      x = r * Math.sin(theta) * Math.cos(phi) * 0.8;
      y = r * Math.cos(theta) * 0.4;
      z = r * Math.sin(theta) * Math.sin(phi) * 0.8;
    } else if (roll < 0.22) {
      x = (Math.random() - 0.5) * BAR_LEN * 2;
      y = (Math.random() - 0.5) * DISK_HEIGHT * 0.4;
      z = (Math.random() - 0.5) * BAR_WIDTH * 2;
    } else {
      const arm = Math.floor(Math.random() * ARMS);
      const armAngle = (arm / ARMS) * Math.PI * 2;
      r = 80 + Math.random() * (DISK_RADIUS - 80);
      const angle = armAngle + ARM_TWIST * (r / DISK_RADIUS) + (Math.random() - 0.5) * 0.6;
      const scatter = (Math.random() - 0.5) * 60 * (1 - (r / DISK_RADIUS) * 0.6);
      x = (r + scatter) * Math.cos(angle);
      z = (r + scatter) * Math.sin(angle);
      y = (Math.random() - 0.5) * DISK_HEIGHT * (1 + r / DISK_RADIUS);

      if (r > 350) {
        y += Math.sin(angle * 2) * 20 * ((r - 350) / 150);
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const radial = Math.sqrt(x * x + z * z) / DISK_RADIUS;
    let t;

    if (params.colorOn) {
      if (radial < 0.15) t = 0.4 + Math.random() * 0.3;
      else if (radial < 0.4) t = 0.2 + Math.random() * 0.5;
      else t = Math.random() * 0.6;

      if (Math.random() < 0.04) {
        t = 0.85 + Math.random() * 0.15;
      }
    } else {
      t = 0.35;
    }

    const [cr, cg, cb] = starColor(t);
    colors[i * 3] = cr;
    colors[i * 3 + 1] = cg;
    colors[i * 3 + 2] = cb;
    sizes[i] = radial < 0.1 ? 2.5 + Math.random() * 2 : 0.8 + Math.random() * 1.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { pointTexture: { value: starTexture } },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (600.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
        vec4 tex = texture2D(pointTexture, gl_PointCoord);
        if (tex.a < 0.05) discard;
        gl_FragColor = vec4(vColor * 1.2, tex.a);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return { points, DISK_RADIUS, starTexture };
}

function buildDustLane(scene, radius) {
  const count = 30000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const arm = Math.floor(Math.random() * 4);
    const armAngle = (arm / 4) * Math.PI * 2 + Math.PI / 8;
    const r = 100 + Math.random() * (radius - 120);
    const angle = armAngle + 3.5 * (r / radius) + (Math.random() - 0.5) * 0.4;
    const scatter = (Math.random() - 0.5) * 30;

    positions[i * 3] = (r + scatter) * Math.cos(angle + 0.1);
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (r + scatter) * Math.sin(angle + 0.1);

    colors[i * 3] = 0.25 + Math.random() * 0.15;
    colors[i * 3 + 1] = 0.08 + Math.random() * 0.06;
    colors[i * 3 + 2] = 0.04;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 18,
    vertexColors: true,
    blending: THREE.NormalBlending,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    map: makeSoftCircle(0.4),
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

function buildNebulae(scene, opacity) {
  const count = 8000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const nebulaColors = [
    [1, 0.1, 0.2],
    [1, 0.4, 0],
    [0.2, 0.5, 1],
    [0.5, 0.1, 1],
    [1, 0.8, 0.1],
  ];

  for (let i = 0; i < count; i += 1) {
    const arm = Math.floor(Math.random() * 4);
    const r = 120 + Math.random() * 360;
    const angle = (arm / 4) * Math.PI * 2 + 3.5 * (r / 500) + (Math.random() - 0.5) * 0.3;
    const patch = Math.floor(Math.random() * 12);
    const patchAngle = angle + patch * 0.5;
    const pr = r + (Math.random() - 0.5) * 25;
    const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];

    positions[i * 3] = pr * Math.cos(patchAngle);
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = pr * Math.sin(patchAngle);
    colors[i * 3] = color[0];
    colors[i * 3 + 1] = color[1];
    colors[i * 3 + 2] = color[2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 22,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: opacity * 0.5,
    depthWrite: false,
    map: makeSoftCircle(0.6),
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

function buildBackgroundStars(scene) {
  const count = 12000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 5000 + Math.random() * 3000;
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = 2 * Math.PI * Math.random();
    const brightness = 0.4 + Math.random() * 0.6;

    positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.cos(theta);
    positions[i * 3 + 2] = radius * Math.sin(theta) * Math.sin(phi);
    colors[i * 3] = brightness;
    colors[i * 3 + 1] = brightness;
    colors[i * 3 + 2] = brightness * 1.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

function buildGlow(scene, glowStrength) {
  const texture = makeGlowTexture();
  const geometry = new THREE.PlaneGeometry(380 * glowStrength, 200 * glowStrength);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: 0.85,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return { mesh, texture };
}

function MilkyWayScene({ isPaused, onPausedChange, showDust = true, showHalo = true }) {
  const containerRef = useRef(null);
  const showSpacetimeFabric = useSpacetimeFabric("milky-way");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 20000);
    camera.position.set(0, 800, 800);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    const releaseInteractionLock = lockSceneInteraction(container, renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.enablePan = false;
    controls.minDistance = 150;
    controls.maxDistance = 4000;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.minPolarAngle = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 0, 0);

    const fabric = createSpacetimeFabric(fabricPresets["milky-way"]);
    fabric.group.visible = showSpacetimeFabric;
    scene.add(fabric.group);

    const params = {
      rotSpeed: 0.3,
      starCount: 120000,
      glowStrength: 1.0,
      colorOn: true,
      nebulaOpacity: 0.7,
    };

    const { points: galaxyPoints, DISK_RADIUS, starTexture } = buildGalaxy(scene, params);
    const dustPoints = buildDustLane(scene, DISK_RADIUS);
    const nebulaPoints = buildNebulae(scene, params.nebulaOpacity);
    const backgroundStars = buildBackgroundStars(scene);
    const { mesh: glowMesh, texture: glowTexture } = buildGlow(scene, params.glowStrength);

    const sunGeo = new THREE.SphereGeometry(3.5, 8, 8);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffee66 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    const sunRadius = 265;
    const sunAngle = -0.4;
    sunMesh.position.set(
      sunRadius * Math.cos(sunAngle),
      0,
      sunRadius * Math.sin(sunAngle),
    );
    scene.add(sunMesh);

    const ambientLight = new THREE.AmbientLight(0x6080ff, 0.3);
    scene.add(ambientLight);

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
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      controls.autoRotate = !isPaused;
      controls.update();

      dustPoints.visible = showDust;
      nebulaPoints.visible = showHalo;
      glowMesh.visible = showHalo;

      if (!isPaused) {
        const angle = delta * params.rotSpeed * 0.05;
        galaxyPoints.rotation.y += angle;
        dustPoints.rotation.y += angle;
        nebulaPoints.rotation.y += angle;
        glowMesh.rotation.y += angle;
        glowMesh.lookAt(camera.position);
        backgroundStars.rotation.y += angle * 0.12;
        sunMesh.rotation.y += angle;
        const pulse = 0.9 + 0.1 * Math.sin(elapsed * 2);
        sunMesh.scale.setScalar(pulse);
      } else {
        glowMesh.lookAt(camera.position);
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      controls.dispose();
      fabric.dispose();

      galaxyPoints.geometry.dispose();
      galaxyPoints.material.dispose();
      dustPoints.geometry.dispose();
      dustPoints.material.map?.dispose?.();
      dustPoints.material.dispose();
      nebulaPoints.geometry.dispose();
      nebulaPoints.material.map?.dispose?.();
      nebulaPoints.material.dispose();
      backgroundStars.geometry.dispose();
      backgroundStars.material.dispose();
      glowMesh.geometry.dispose();
      glowMesh.material.dispose();
      glowTexture.dispose();
      starTexture.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      renderer.dispose();
      releaseInteractionLock();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showDust, showHalo, showSpacetimeFabric]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default MilkyWayScene;
