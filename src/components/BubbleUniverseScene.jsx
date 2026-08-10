import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";

const BUBBLE_COUNT = 52;
const OVERVIEW_DISTANCE = 48;
const BUBBLE_GAP = 1.6;

const bubbleVertexShader = `
  uniform float uTime;
  uniform float uSeed;
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vLocalPosition = position;
    float ripple = sin(position.x * 5.0 + uTime * 0.18 + uSeed) *
      sin(position.y * 4.0 - uTime * 0.13) * 0.006;
    vec3 displaced = position + normal * ripple;
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const noiseFunctions = `
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(
        mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x),
        f.y
      ),
      mix(
        mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x),
        f.y
      ),
      f.z
    );
  }

  float fbm(vec3 p) {
    float result = 0.0;
    float amplitude = 0.52;
    for (int octave = 0; octave < 5; octave++) {
      result += valueNoise(p) * amplitude;
      p = p * 2.03 + 0.17;
      amplitude *= 0.5;
    }
    return result;
  }
`;

const bubbleFragmentShader = `
  uniform float uTime;
  uniform float uSeed;
  uniform float uFocus;
  uniform vec3 uDeepColor;
  uniform vec3 uCloudColor;
  uniform vec3 uHotColor;
  uniform vec3 uCameraPosition;
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  ${noiseFunctions}

  void main() {
    vec3 spherePoint = normalize(vLocalPosition);
    float time = uTime * 0.045;
    vec3 flow = vec3(time, -time * 0.63, time * 0.38);
    float broadClouds = fbm(spherePoint * 3.4 + flow + uSeed * 3.71);
    float smallClouds = fbm(spherePoint * 8.2 - flow * 1.4 + uSeed * 1.93);
    float filaments = smoothstep(0.48, 0.69, fbm(spherePoint * 14.0 + flow * 0.75 + uSeed));
    float voids = smoothstep(0.18, 0.57, broadClouds);

    vec3 color = mix(uDeepColor * 0.32, uDeepColor, voids);
    color = mix(color, uCloudColor, smoothstep(0.42, 0.76, broadClouds + smallClouds * 0.24));
    color = mix(color, uHotColor, filaments * (0.34 + smallClouds * 0.62));

    vec3 starCell = floor((spherePoint + broadClouds * 0.025) * 92.0 + uSeed * 19.0);
    float star = step(0.9962, hash31(starCell));
    float brightStar = step(0.9992, hash31(starCell + 11.7));
    color += vec3(0.78, 0.9, 1.0) * star * 1.7;
    color += vec3(1.0, 0.82, 0.5) * brightStar * 3.0;

    vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDirection, normalize(vWorldNormal)), 0.0), 2.15);
    color += mix(uCloudColor, uHotColor, 0.45) * fresnel * (0.38 + uFocus * 0.62);
    color *= 0.88 + smallClouds * 0.24;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const shellVertexShader = `
  uniform float uTime;
  uniform float uSeed;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPosition;

  void main() {
    vLocalPosition = position;
    float breathing = sin(uTime * 0.21 + uSeed) * 0.0035;
    vec3 displaced = position + normal * breathing;
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const shellFragmentShader = `
  uniform float uTime;
  uniform float uSeed;
  uniform float uFocus;
  uniform vec3 uCameraPosition;
  uniform vec3 uRimColor;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPosition;
  ${noiseFunctions}

  void main() {
    vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
    float facing = max(dot(viewDirection, normalize(vWorldNormal)), 0.0);
    float fresnel = pow(1.0 - facing, 1.75);
    float membrane = fbm(normalize(vLocalPosition) * 7.0 + uSeed * 2.1 + uTime * 0.018);
    vec3 rainbow = 0.52 + 0.48 * cos(
      6.28318 * (vec3(0.02, 0.28, 0.58) + fresnel * 0.68 + membrane * 0.12 + uSeed * 0.03)
    );
    vec3 color = mix(uRimColor, rainbow, 0.38) * (0.55 + fresnel * 1.2);
    float alpha = clamp(fresnel * (0.33 + uFocus * 0.15) + membrane * 0.035, 0.02, 0.62);
    gl_FragColor = vec4(color, alpha);
  }
`;

const accretionVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const accretionFragmentShader = `
  uniform float uTime;
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vec2 p = vUv - 0.5;
    float radius = length(p) * 2.0;
    float angle = atan(p.y, p.x);
    float inner = smoothstep(0.22, 0.37, radius);
    float outer = 1.0 - smoothstep(0.9, 1.1, radius);
    float band = inner * outer;
    float warped = angle / 6.28318 + uTime * (0.16 / max(radius, 0.26));
    vec2 sampleUv = vec2(warped, radius * 2.1 - uTime * 0.13);
    vec4 tex = texture2D(uTexture, sampleUv);
    float hot = pow(max(0.0, 1.0 - abs(radius - 0.4) * 3.0), 3.9);
    float mid = pow(max(0.0, 1.0 - abs(radius - 0.58) * 2.2), 2.5);
    float dense = pow(max(0.0, 1.0 - abs(radius - 0.5) * 2.25), 2.1);
    float doppler = smoothstep(-1.0, 1.0, sin(angle - 0.82)) * 1.58 + 0.24;
    float turbulence = sin(angle * 10.0 - uTime * 1.9 + radius * 12.0) * 0.5 + 0.5;
    vec3 cold = vec3(0.26, 0.05, 0.95);
    vec3 warm = vec3(1.0, 0.28, 0.02);
    vec3 whiteHot = vec3(1.0, 0.94, 0.72);
    vec3 color = mix(cold, warm, smoothstep(0.24, 0.8, radius));
    color = mix(color, whiteHot, hot * 0.98 + mid * 0.26 + dense * 0.16);
    color *= tex.rgb * (0.8 + doppler + turbulence * 0.24 + dense * 0.26);
    float alpha = band * tex.a * (1.08 + hot * 1.65 + mid * 0.68 + dense * 1.05);
    gl_FragColor = vec4(color, alpha);
  }
`;

function seededRandom(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function makeSoftTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.12, "rgba(255,255,255,0.62)");
  gradient.addColorStop(0.42, "rgba(255,255,255,0.13)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBlackHoleGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(256, 256, 10, 256, 256, 256);
  gradient.addColorStop(0, "rgba(255,245,225,1)");
  gradient.addColorStop(0.12, "rgba(255,180,70,0.95)");
  gradient.addColorStop(0.34, "rgba(255,110,20,0.5)");
  gradient.addColorStop(0.55, "rgba(120,60,255,0.18)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBlackHoleAccretionTexture() {
  const size = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const image = context.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x / size - 0.5;
      const dy = y / size - 0.5;
      const radius = Math.sqrt(dx * dx + dy * dy) * 2;
      const angle = Math.atan2(dy, dx);
      const spiral = Math.sin(angle * 24 + radius * 76) * 0.5 + 0.5;
      const turbulence = Math.sin(dx * 38) * Math.cos(dy * 45) * 0.5 + 0.5;
      const noise = Math.random() * 0.22 + spiral * 0.5 + turbulence * 0.26;
      const falloff = Math.max(0, 1 - Math.pow(radius, 1.38));
      const bandBoost = Math.max(0, 1 - Math.abs(radius - 0.48) * 1.9);
      const brightness = noise * falloff * (0.9 + bandBoost * 0.75);
      const pixelIndex = (y * size + x) * 4;
      image.data[pixelIndex] = 255;
      image.data[pixelIndex + 1] = 80 + brightness * 160;
      image.data[pixelIndex + 2] = 10 + brightness * 90;
      image.data[pixelIndex + 3] = Math.floor(255 * brightness);
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildStarField(scene, texture) {
  const starCount = 5200;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color(0x829dff),
    new THREE.Color(0xdde8ff),
    new THREE.Color(0xffd6a3),
  ];

  for (let index = 0; index < starCount; index += 1) {
    const radius = 130 + Math.random() * 340;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const color = palette[Math.floor(Math.random() * palette.length)];
    const brightness = 0.45 + Math.random() * 0.55;
    colors[index * 3] = color.r * brightness;
    colors[index * 3 + 1] = color.g * brightness;
    colors[index * 3 + 2] = color.b * brightness;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    map: texture,
    size: 1.25,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

function buildCosmicMist(scene, texture) {
  const count = 440;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = 35 + Math.random() * 105;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi) * 0.55;
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    const violet = Math.random() > 0.48;
    colors[index * 3] = violet ? 0.19 : 0.04;
    colors[index * 3 + 1] = violet ? 0.08 : 0.18;
    colors[index * 3 + 2] = violet ? 0.42 : 0.38;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    map: texture,
    size: 24,
    transparent: true,
    opacity: 0.085,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mist = new THREE.Points(geometry, material);
  scene.add(mist);
  return mist;
}

function buildCollapsedRegion(scene, position) {
  const accretionTexture = createBlackHoleAccretionTexture();
  const glowTexture = createBlackHoleGlowTexture();
  const group = new THREE.Group();
  group.position.copy(position);
  group.scale.setScalar(0.55);
  scene.add(group);

  const eventHorizon = new THREE.Mesh(
    new THREE.SphereGeometry(2.78, 160, 160),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  );
  group.add(eventHorizon);

  const lensMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
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
        float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.5);
        vec3 color = mix(vec3(0.34, 0.12, 1.0), vec3(1.0, 0.42, 0.08), fresnel);
        gl_FragColor = vec4(color, fresnel * 0.28);
      }
    `,
  });
  const lensShell = new THREE.Mesh(new THREE.SphereGeometry(3.15, 112, 112), lensMaterial);
  group.add(lensShell);

  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.06, 28, 320),
    new THREE.MeshBasicMaterial({
      color: 0xffc896,
      transparent: true,
      opacity: 0.72,
    }),
  );
  photonRing.rotation.x = Math.PI / 2;
  group.add(photonRing);

  const hotGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xff7a18,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  hotGlow.scale.set(21, 21, 1);
  group.add(hotGlow);

  const coolGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x6659ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  coolGlow.scale.set(34, 34, 1);
  group.add(coolGlow);

  const hawkingJet = new THREE.Group();
  const jetMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0x9ac7ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  for (let index = 0; index < 7; index += 1) {
    const sprite = new THREE.Sprite(jetMaterial);
    const scale = 2.1 + index * 1.35;
    sprite.scale.set(0.7 + index * 0.2, scale, 1);
    sprite.position.y = 2.8 + index * 1.45;
    hawkingJet.add(sprite);

    const mirrored = sprite.clone();
    mirrored.position.y = -sprite.position.y;
    mirrored.material = jetMaterial;
    hawkingJet.add(mirrored);
  }
  hawkingJet.rotation.z = 0.12;
  group.add(hawkingJet);

  const diskMaterial = new THREE.ShaderMaterial({
    vertexShader: accretionVertexShader,
    fragmentShader: accretionFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: accretionTexture },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const disk = new THREE.Mesh(new THREE.RingGeometry(3.08, 11.6, 640, 100), diskMaterial);
  disk.rotation.x = Math.PI / 2.62;
  disk.scale.set(1.18, 0.98, 1);
  group.add(disk);

  const secondaryDisk = new THREE.Mesh(
    new THREE.RingGeometry(3.22, 9.3, 420, 72),
    new THREE.MeshBasicMaterial({
      color: 0xff8f3a,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  secondaryDisk.rotation.x = Math.PI / 2.38;
  secondaryDisk.scale.set(0.94, 0.72, 1);
  group.add(secondaryDisk);

  const hitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(6.2, 24, 18),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hitTarget.userData.isBlackHoleHitTarget = true;
  group.add(hitTarget);

  const update = (time, delta, cameraPosition) => {
    lensMaterial.uniforms.cameraPositionWorld.value.copy(cameraPosition);
    group.rotation.y += delta * 0.108;
    disk.rotation.z -= delta * 0.72;
    secondaryDisk.rotation.z += delta * 0.24;
    diskMaterial.uniforms.uTime.value = time;
    photonRing.scale.setScalar(1 + Math.sin(time * 2.2) * 0.018);
    hotGlow.material.opacity = 0.82 + Math.sin(time * 1.4) * 0.08;
    coolGlow.material.opacity = 0.18 + Math.sin(time * 0.8) * 0.04;
    hawkingJet.scale.y = 1 + Math.sin(time * 2.6) * 0.05;
    hawkingJet.rotation.y += delta * 0.24;
  };

  const dispose = () => {
    group.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose?.();
    });
    accretionTexture.dispose();
    glowTexture.dispose();
  };

  return {
    group,
    hitTargets: [hitTarget, eventHorizon, lensShell, photonRing, disk, secondaryDisk],
    names: { AR: "الثقب الأسود", EN: "Black Hole" },
    update,
    dispose,
  };
}

function bubbleName(index, isOurs) {
  if (isOurs) {
    return { AR: "كوننا", EN: "Our Universe" };
  }

  return {
    AR: `الكون الفقاعي ${String(index + 1).padStart(2, "0")}`,
    EN: `Bubble Universe ${String(index + 1).padStart(2, "0")}`,
  };
}

function getBubbleClearance(position, radius, floatAmplitude, bubbles) {
  return bubbles.reduce((minimum, bubble) => {
    const safeDistance =
      radius +
      bubble.userData.radius +
      BUBBLE_GAP +
      floatAmplitude +
      bubble.userData.amplitude;
    return Math.min(minimum, position.distanceTo(bubble.userData.basePosition) - safeDistance);
  }, Number.POSITIVE_INFINITY);
}

function findBubblePosition(index, radius, floatAmplitude, bubbles, isOurs) {
  let bestPosition = new THREE.Vector3();
  let bestClearance = Number.NEGATIVE_INFINITY;

  for (let attempt = 0; attempt < 180; attempt += 1) {
    const sample = index * 193.7 + attempt * 37.1;
    const innerDistance = isOurs ? 12 : 8;
    const outerDistance = isOurs ? 21 : 43;
    const distance =
      innerDistance + Math.cbrt(seededRandom(sample + 1.7)) * (outerDistance - innerDistance);
    const theta = seededRandom(sample + 11.3) * Math.PI * 2;
    const phi = Math.acos(2 * seededRandom(sample + 23.9) - 1);
    const candidate = new THREE.Vector3(
      distance * Math.sin(phi) * Math.cos(theta),
      distance * Math.cos(phi) * 0.76,
      distance * Math.sin(phi) * Math.sin(theta),
    );
    const clearance = getBubbleClearance(candidate, radius, floatAmplitude, bubbles);

    if (clearance >= 0) return candidate;
    if (clearance > bestClearance) {
      bestClearance = clearance;
      bestPosition = candidate;
    }
  }

  const outwardDirection = bestPosition.clone().normalize();
  if (outwardDirection.lengthSq() < 0.1) outwardDirection.set(1, 0.35, 0.7).normalize();
  while (getBubbleClearance(bestPosition, radius, floatAmplitude, bubbles) < 0) {
    bestPosition.addScaledVector(outwardDirection, 1.25);
  }
  return bestPosition;
}

function BubbleUniverseScene({ isPaused = false, onFocusChange, resetVersion = 0 }) {
  const containerRef = useRef(null);
  const pausedRef = useRef(isPaused);
  const focusCallbackRef = useRef(onFocusChange);
  const resetSceneRef = useRef(null);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    focusCallbackRef.current = onFocusChange;
  }, [onFocusChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01020a);
    scene.fog = new THREE.FogExp2(0x020313, 0.0068);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.08, 1000);
    camera.position.set(27, 20, 34);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);
    const releaseInteractionLock = lockSceneInteraction(container, renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 105;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI - 0.12;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.32;
    controls.target.set(0, 0, 0);

    const softTexture = makeSoftTexture();
    const starField = buildStarField(scene, softTexture);
    const cosmicMist = buildCosmicMist(scene, softTexture);

    const bubbleGeometry = new THREE.SphereGeometry(1, 48, 36);
    const shellGeometry = new THREE.SphereGeometry(1.045, 48, 36);
    const bubbleGroup = new THREE.Group();
    const bubbles = [];
    const glows = [];
    scene.add(bubbleGroup);

    const blackHolePosition = new THREE.Vector3(-8, -2.4, 5);
    const collapsedRegion = buildCollapsedRegion(scene, blackHolePosition);
    const collisionBodies = [
      {
        userData: {
          radius: 7.8,
          amplitude: 0,
          basePosition: blackHolePosition,
        },
      },
    ];

    const palettes = [
      [0x090b2f, 0x4b3ea8, 0xff8a58, 0xb8c7ff],
      [0x07162f, 0x116b91, 0x62e6d4, 0x9ff9ff],
      [0x240822, 0x9b365f, 0xffb36b, 0xffc5e6],
      [0x12082d, 0x6932a8, 0xd971ff, 0xcdb8ff],
      [0x231106, 0xa6471e, 0xffd27c, 0xffd8b1],
    ];
    const ourUniverseIndex = 7;

    for (let index = 0; index < BUBBLE_COUNT; index += 1) {
      const isOurs = index === ourUniverseIndex;
      const radius = isOurs ? 2.7 : 0.9 + seededRandom(index + 1.4) * 2.35;
      const floatAmplitude = 0.14 + seededRandom(index + 73.2) * 0.38;
      const palette = isOurs ? [0x030d2a, 0x1765b8, 0x8ae8ff, 0xc8f4ff] : palettes[index % palettes.length];
      const seed = seededRandom(index + 4.2) * 41 + index;
      const position = findBubblePosition(index, radius, floatAmplitude, collisionBodies, isOurs);

      const material = new THREE.ShaderMaterial({
        vertexShader: bubbleVertexShader,
        fragmentShader: bubbleFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: seed },
          uFocus: { value: 0 },
          uDeepColor: { value: new THREE.Color(palette[0]) },
          uCloudColor: { value: new THREE.Color(palette[1]) },
          uHotColor: { value: new THREE.Color(palette[2]) },
          uCameraPosition: { value: new THREE.Vector3() },
        },
      });
      const bubble = new THREE.Mesh(bubbleGeometry, material);
      bubble.scale.setScalar(radius);
      bubble.position.copy(position);
      bubble.userData = {
        radius,
        names: bubbleName(index, isOurs),
        basePosition: bubble.position.clone(),
        phase: seededRandom(index + 51.3) * Math.PI * 2,
        speed: 0.11 + seededRandom(index + 61.9) * 0.18,
        amplitude: floatAmplitude,
      };

      const shellMaterial = new THREE.ShaderMaterial({
        vertexShader: shellVertexShader,
        fragmentShader: shellFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: seed },
          uFocus: { value: 0 },
          uCameraPosition: { value: new THREE.Vector3() },
          uRimColor: { value: new THREE.Color(palette[3]) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });
      const shell = new THREE.Mesh(shellGeometry, shellMaterial);
      bubble.add(shell);
      bubble.userData.shell = shell;

      const glowMaterial = new THREE.SpriteMaterial({
        map: softTexture,
        color: palette[2],
        transparent: true,
        opacity: isOurs ? 0.2 : 0.09,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Sprite(glowMaterial);
      glow.scale.setScalar(3.35);
      bubble.add(glow);
      glows.push(glow);

      bubbleGroup.add(bubble);
      bubbles.push(bubble);
      collisionBodies.push(bubble);
    }

    const satelliteGeometry = new THREE.SphereGeometry(1, 24, 18);
    const satellites = [];
    for (let index = 0; index < 22; index += 1) {
      const host = bubbles[Math.floor(seededRandom(index + 90.2) * bubbles.length)];
      const radius = 0.12 + seededRandom(index + 102.4) * 0.3;
      const amplitude = 0.08 + seededRandom(index + 170.4) * 0.16;
      let satellitePosition = null;

      for (let attempt = 0; attempt < 80; attempt += 1) {
        const sample = index * 83.4 + attempt * 29.7;
        const direction = new THREE.Vector3(
          seededRandom(sample + 1.2) - 0.5,
          seededRandom(sample + 9.8) - 0.5,
          seededRandom(sample + 18.6) - 0.5,
        ).normalize();
        const distance =
          host.userData.radius +
          radius +
          host.userData.amplitude +
          amplitude +
          0.45 +
          seededRandom(sample + 28.1) * 0.7;
        const candidate = host.position.clone().addScaledVector(direction, distance);
        const clearsBubbles = collisionBodies.every(
          (bubble) =>
            candidate.distanceTo(bubble.userData.basePosition) >=
            radius + bubble.userData.radius + amplitude + bubble.userData.amplitude + 0.22,
        );
        const clearsSatellites = satellites.every(
          (satellite) =>
            candidate.distanceTo(satellite.userData.basePosition) >=
            radius + satellite.userData.radius + amplitude + satellite.userData.amplitude + 0.16,
        );
        if (clearsBubbles && clearsSatellites) {
          satellitePosition = candidate;
          break;
        }
      }

      if (!satellitePosition) continue;
      const material = new THREE.MeshBasicMaterial({
        color: index % 2 ? 0x8668d8 : 0xe68a68,
        transparent: true,
        opacity: 0.72,
      });
      const satellite = new THREE.Mesh(satelliteGeometry, material);
      satellite.scale.setScalar(radius);
      satellite.position.copy(satellitePosition);
      satellite.userData = {
        radius,
        basePosition: satellite.position.clone(),
        phase: seededRandom(index + 150.6) * Math.PI * 2,
        speed: 0.22 + seededRandom(index + 160.8) * 0.24,
        amplitude,
      };
      bubbleGroup.add(satellite);
      satellites.push(satellite);
    }

    scene.add(new THREE.AmbientLight(0x34488f, 0.34));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerStart = new THREE.Vector2();
    let focusedBubble = null;
    let isBlackHoleFocused = false;
    let focusedPosition = new THREE.Vector3();
    let transition = null;
    let frameId;

    const startCameraTransition = (target, distance, nextFocus) => {
      const direction = camera.position.clone().sub(controls.target).normalize();
      if (direction.lengthSq() < 0.1) direction.set(0.6, 0.35, 0.72).normalize();
      transition = {
        startedAt: performance.now(),
        duration: 1250,
        fromTarget: controls.target.clone(),
        toTarget: target.clone(),
        fromCamera: camera.position.clone(),
        toCamera: target.clone().addScaledVector(direction, distance),
        nextFocus,
      };
      controls.enabled = false;
    };

    const clearFocus = () => {
      if (focusedBubble) {
        focusedBubble.material.uniforms.uFocus.value = 0;
        focusedBubble.userData.shell.material.uniforms.uFocus.value = 0;
      }
      focusedBubble = null;
      isBlackHoleFocused = false;
      focusCallbackRef.current?.(null);
      startCameraTransition(new THREE.Vector3(0, 0, 0), OVERVIEW_DISTANCE, null);
    };
    resetSceneRef.current = clearFocus;

    const focusBubble = (bubble) => {
      if (focusedBubble && focusedBubble !== bubble) {
        focusedBubble.material.uniforms.uFocus.value = 0;
        focusedBubble.userData.shell.material.uniforms.uFocus.value = 0;
      }
      isBlackHoleFocused = false;
      focusedBubble = bubble;
      focusedPosition.copy(bubble.position);
      bubble.material.uniforms.uFocus.value = 1;
      bubble.userData.shell.material.uniforms.uFocus.value = 1;
      focusCallbackRef.current?.({ ...bubble.userData.names });
      startCameraTransition(bubble.position, Math.max(4.2, bubble.userData.radius * 3.15), bubble);
    };

    const focusBlackHole = () => {
      if (focusedBubble) {
        focusedBubble.material.uniforms.uFocus.value = 0;
        focusedBubble.userData.shell.material.uniforms.uFocus.value = 0;
      }
      focusedBubble = null;
      isBlackHoleFocused = true;
      focusCallbackRef.current?.({ ...collapsedRegion.names });
      startCameraTransition(collapsedRegion.group.position, 12.5, collapsedRegion.group);
    };

    const handlePointerDown = (event) => {
      pointerStart.set(event.clientX, event.clientY);
      renderer.domElement.style.cursor = "grabbing";
    };
    const handlePointerUp = (event) => {
      renderer.domElement.style.cursor = "grab";
      if (pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 7) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...bubbles, ...collapsedRegion.hitTargets], false);
      if (hits.length === 0) return;
      if (hits[0].object.userData.isBlackHoleHitTarget || collapsedRegion.hitTargets.includes(hits[0].object)) {
        focusBlackHole();
      } else {
        focusBubble(hits[0].object);
      }
    };
    const handlePointerCancel = () => {
      renderer.domElement.style.cursor = "grab";
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerCancel);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let simulationTime = 0;
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!pausedRef.current) simulationTime += delta;
      const elapsed = simulationTime;

      bubbles.forEach((bubble, index) => {
        const data = bubble.userData;
        bubble.position.copy(data.basePosition);
        bubble.position.y += Math.sin(elapsed * data.speed + data.phase) * data.amplitude;
        bubble.position.x += Math.cos(elapsed * data.speed * 0.63 + data.phase) * data.amplitude * 0.18;
        if (!pausedRef.current) bubble.rotation.y += delta * (0.018 + (index % 4) * 0.003);
        bubble.material.uniforms.uTime.value = elapsed;
        bubble.material.uniforms.uCameraPosition.value.copy(camera.position);
        data.shell.material.uniforms.uTime.value = elapsed;
        data.shell.material.uniforms.uCameraPosition.value.copy(camera.position);
      });

      satellites.forEach((satellite) => {
        const data = satellite.userData;
        satellite.position.copy(data.basePosition);
        satellite.position.y += Math.sin(elapsed * data.speed + data.phase) * data.amplitude;
      });

      if (!pausedRef.current) {
        starField.rotation.y += delta * 0.003;
        cosmicMist.rotation.y -= delta * 0.006;
      }
      collapsedRegion.update(elapsed, pausedRef.current ? 0 : delta, camera.position);

      if (transition) {
        const progress = Math.min((performance.now() - transition.startedAt) / transition.duration, 1);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const destination = transition.nextFocus?.position ?? transition.toTarget;
        controls.target.lerpVectors(transition.fromTarget, destination, eased);
        const dynamicCameraDestination = destination
          .clone()
          .add(transition.toCamera.clone().sub(transition.toTarget));
        camera.position.lerpVectors(transition.fromCamera, dynamicCameraDestination, eased);
        if (progress >= 1) {
          controls.enabled = true;
          transition = null;
          if (focusedBubble) focusedPosition.copy(focusedBubble.position);
        }
      } else if (focusedBubble) {
        const movement = focusedBubble.position.clone().sub(focusedPosition);
        camera.position.add(movement);
        controls.target.copy(focusedBubble.position);
        focusedPosition.copy(focusedBubble.position);
      }

      controls.autoRotate = !pausedRef.current && !focusedBubble && !isBlackHoleFocused && !transition;
      controls.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerCancel);
      resetSceneRef.current = null;
      controls.dispose();
      releaseInteractionLock();
      collapsedRegion.dispose();

      bubbles.forEach((bubble) => {
        bubble.material.dispose();
        bubble.userData.shell.material.dispose();
      });
      satellites.forEach((satellite) => satellite.material.dispose());
      glows.forEach((glow) => glow.material.dispose());
      bubbleGeometry.dispose();
      shellGeometry.dispose();
      satelliteGeometry.dispose();
      starField.geometry.dispose();
      starField.material.dispose();
      cosmicMist.geometry.dispose();
      cosmicMist.material.dispose();
      softTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    if (resetVersion > 0) resetSceneRef.current?.();
  }, [resetVersion]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default BubbleUniverseScene;
