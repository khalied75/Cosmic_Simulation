import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createStars() {
  const count = 6800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 48 + Math.random() * 145;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i * 3 + 2] = Math.cos(phi) * radius;

    const cool = Math.random();
    colors[i * 3] = cool < 0.3 ? 0.72 : 0.94;
    colors[i * 3 + 1] = cool < 0.3 ? 0.88 : 0.97;
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
      transparent: true,
      opacity: 0.88,
    }),
  );
}

function createUranusTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  [
    [0, "#d9fff9"],
    [0.16, "#b1f4ef"],
    [0.34, "#8fd9df"],
    [0.52, "#73c6d2"],
    [0.7, "#7dd5e1"],
    [0.86, "#a8edf0"],
    [1, "#d7fffb"],
  ].forEach(([stop, color]) => base.addColorStop(stop, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const band = Math.sin(y * 0.0075) + Math.sin(y * 0.021) * 0.45 + Math.sin(y * 0.059) * 0.12;
    ctx.fillStyle =
      band > 0
        ? `rgba(228,255,252,${0.018 + band * 0.028})`
        : `rgba(76,157,175,${0.022 + Math.abs(band) * 0.03})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 8 + 1;
    const tone = Math.random();
    ctx.fillStyle =
      tone < 0.48
        ? `rgba(236,255,255,${Math.random() * 0.08})`
        : `rgba(103,198,214,${Math.random() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * (2.5 + Math.random() * 4.5), radius * 0.22, Math.random() * Math.PI * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle polar cap glow and a faint storm detail.
  const polarGlow = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.12, 20, canvas.width * 0.5, canvas.height * 0.12, 320);
  polarGlow.addColorStop(0, "rgba(255,255,255,0.4)");
  polarGlow.addColorStop(0.5, "rgba(220,255,252,0.15)");
  polarGlow.addColorStop(1, "rgba(180,240,245,0)");
  ctx.fillStyle = polarGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3);

  const storm = ctx.createRadialGradient(canvas.width * 0.61, canvas.height * 0.58, 10, canvas.width * 0.61, canvas.height * 0.58, 100);
  storm.addColorStop(0, "rgba(252,255,255,0.6)");
  storm.addColorStop(0.35, "rgba(205,255,255,0.24)");
  storm.addColorStop(1, "rgba(149,231,236,0)");
  ctx.fillStyle = storm;
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.61, canvas.height * 0.58, 88, 38, -0.18, 0, Math.PI * 2);
  ctx.fill();

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
    [0, "rgba(180,220,230,0)"],
    [0.14, "rgba(188,228,236,0.12)"],
    [0.2, "rgba(214,245,250,0.34)"],
    [0.29, "rgba(75,110,125,0.05)"],
    [0.43, "rgba(198,236,244,0.22)"],
    [0.58, "rgba(82,118,132,0.04)"],
    [0.72, "rgba(188,228,236,0.16)"],
    [1, "rgba(180,220,230,0)"],
  ].forEach(([stop, color]) => gradient.addColorStop(stop, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 4200; i += 1) {
    ctx.fillStyle = `rgba(222,248,252,${Math.random() * 0.2})`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2.5, 1);
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
        float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.2);
        vec3 color = mix(vec3(0.48, 0.87, 0.92), vec3(0.92, 1.0, 1.0), fresnel);
        gl_FragColor = vec4(color, fresnel * 0.38);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    transparent: true,
  });
}

function UranusScene({ isPaused, onPausedChange, showAtmosphere = true, showRings = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02070a);
    scene.fog = new THREE.FogExp2(0x021116, 0.000018);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.55, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.26;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.34;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 2.9;
    controls.maxDistance = 22;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.16;

    scene.add(createStars());
    scene.add(new THREE.AmbientLight(0x10282f, 0.92));
    const sun = new THREE.DirectionalLight(0xe7ffff, 3.4);
    sun.position.set(8, 4, 8);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x78d8e4, 1.15);
    fill.position.set(-5, -1, -6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xd2ffff, 1.4);
    rim.position.set(0, -2, -8);
    scene.add(rim);

    const uranusTexture = createUranusTexture();
    const uranusGroup = new THREE.Group();
    const uranus = new THREE.Mesh(
      new THREE.SphereGeometry(1.82, 224, 224),
      new THREE.MeshStandardMaterial({
        map: uranusTexture,
        roughness: 0.44,
        metalness: 0.01,
      }),
    );
    uranusGroup.add(uranus);

    const atmosphereMaterial = createAtmosphereMaterial();
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.9, 160, 160), atmosphereMaterial);
    uranusGroup.add(atmosphere);

    const ringTexture = createRingTexture();
    const ringGeometry = new THREE.RingGeometry(2.34, 3.55, 256);
    const position = ringGeometry.attributes.position;
    const uv = ringGeometry.attributes.uv;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const distance = Math.sqrt(x * x + y * y);
      uv.setXY(i, (distance - 2.34) / (3.55 - 2.34), 0.5);
    }

    const rings = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.74,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    rings.rotation.x = 0.44;
    rings.rotation.z = 1.47;
    uranusGroup.add(rings);
    scene.add(uranusGroup);

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
        uranus.rotation.y -= 0.0002;
        atmosphere.rotation.y += 0.00012;
        rings.rotation.y += 0.00008;
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
      uranusTexture.dispose();
      ringTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showAtmosphere, showRings]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default UranusScene;
