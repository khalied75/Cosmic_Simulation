import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lockSceneInteraction } from "./sceneInteractionLock";

const BAR_ANGLE = 0.92;

function createParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 44);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,245,225,0.95)");
  gradient.addColorStop(0.72, "rgba(170,205,255,0.35)");
  gradient.addColorStop(1, "rgba(170,205,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createNebulaTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(256, 256, 12, 256, 256, 220);
  gradient.addColorStop(0, "rgba(255,248,226,1)");
  gradient.addColorStop(0.24, "rgba(255,218,132,0.96)");
  gradient.addColorStop(0.52, "rgba(201,188,146,0.3)");
  gradient.addColorStop(0.78, "rgba(109,129,208,0.12)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPointsMaterial(texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTexture: { value: texture },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float aSize;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float depthScale = clamp(220.0 / -mvPosition.z, 0.0, 16.0);
        gl_PointSize = aSize * uPixelRatio * depthScale;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec3 vColor;
      void main() {
        vec4 sprite = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(vColor, 1.0) * sprite;
      }
    `,
    vertexColors: true,
  });
}

function createBackgroundStars(texture) {
  const count = 8000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const radius = 120 + Math.random() * 900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const offset = index * 3;

    positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[offset + 2] = radius * Math.cos(phi);

    const warm = Math.random() > 0.72;
    colors[offset] = warm ? 1 : 0.72 + Math.random() * 0.28;
    colors[offset + 1] = 0.82 + Math.random() * 0.18;
    colors[offset + 2] = warm ? 0.62 + Math.random() * 0.18 : 1;
    sizes[index] = 1 + Math.random() * 2.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  return new THREE.Points(geometry, createPointsMaterial(texture));
}

function createGalaxyPoints(texture, { count = 22000, scale = 1, colorTint } = {}) {
  const armCount = 2;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const tint = colorTint ? new THREE.Color(colorTint) : null;

  for (let index = 0; index < count; index += 1) {
    const radius = Math.pow(Math.random(), 0.5) * 62;
    const armIndex = index % armCount;
    const armOffset = (armIndex / armCount) * Math.PI * 2;
    const spin = radius * 0.245;
    const armTightness = 0.08 + (radius / 62) * 0.16;
    const angleJitter = (Math.random() - 0.5) * armTightness;
    const branchMix = (Math.random() - 0.5) * 0.28 * (radius / 62);
    const angle = armOffset + spin + angleJitter + branchMix;
    const verticalSpread = (Math.random() - 0.5) * (0.04 + radius * 0.008);
    const radialJitter = (Math.random() - 0.5) * (0.95 + radius * 0.024);
    const x = Math.cos(angle) * (radius + radialJitter) * scale;
    const z = Math.sin(angle) * (radius + radialJitter) * scale;
    const y = verticalSpread * scale;
    const offset = index * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;

    const bulgeMix = Math.max(0, 1 - radius / 16);
    const midMix = Math.max(0, 1 - Math.abs(radius - 28) / 18);
    const outerMix = Math.min(1, radius / 62);
    let red = 0.68 + bulgeMix * 0.28 + midMix * 0.06;
    let green = 0.68 + bulgeMix * 0.18 + midMix * 0.05;
    let blue = 0.82 + outerMix * 0.22 - bulgeMix * 0.22;

    if (tint) {
      red *= tint.r;
      green *= tint.g;
      blue *= tint.b;
    }

    colors[offset] = red;
    colors[offset + 1] = green;
    colors[offset + 2] = blue;
    sizes[index] = (2.8 + Math.random() * 4.6 + bulgeMix * 4.8) * scale;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  return new THREE.Points(geometry, createPointsMaterial(texture));
}

function createArmGlow() {
  const geometry = new THREE.RingGeometry(10, 60, 300, 1);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColorA: { value: new THREE.Color(0xfff2dd) },
      uColorB: { value: new THREE.Color(0xb9caff) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      void main() {
        vec2 centered = vUv - 0.5;
        float angle = atan(centered.y, centered.x);
        float radius = length(centered) * 2.0;
        float spiral = sin(angle * 2.0 - radius * 11.2);
        float arms = smoothstep(0.52, 0.98, spiral * 0.5 + 0.5);
        float innerFade = smoothstep(0.16, 0.33, radius);
        float outerFade = 1.0 - smoothstep(0.82, 1.06, radius);
        float alpha = arms * innerFade * outerFade * 0.32;
        vec3 color = mix(uColorB, uColorA, 0.55);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.scale.set(2.08, 0.12, 1.24);
  return mesh;
}

function createCentralBar(texture) {
  const count = 12000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const t = Math.random() * 2 - 1;
    const taper = Math.sqrt(1 - Math.min(0.999, t * t));
    const longitudinal = t * 13.8 + (Math.random() - 0.5) * 1.2;
    const lateral = (Math.random() - 0.5) * (1.35 + taper * 1.8);
    const x = longitudinal * Math.cos(BAR_ANGLE) - lateral * Math.sin(BAR_ANGLE);
    const z = longitudinal * Math.sin(BAR_ANGLE) + lateral * Math.cos(BAR_ANGLE);
    const y = (Math.random() - 0.5) * (0.18 + taper * 0.34);
    const centerMix = Math.max(0, 1 - Math.abs(t));
    const warmMix = 0.55 + centerMix * 0.45;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;

    colors[offset] = 0.82 + warmMix * 0.18;
    colors[offset + 1] = 0.72 + warmMix * 0.2;
    colors[offset + 2] = 0.66 + centerMix * 0.12;
    sizes[index] = 1.6 + Math.random() * 2.1 + taper * 1.8 + centerMix * 2.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  return new THREE.Points(geometry, createPointsMaterial(texture));
}

function createDustLane() {
  const geometry = new THREE.TorusGeometry(28, 10, 48, 360);
  const material = new THREE.MeshBasicMaterial({
    color: 0x5a4233,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.scale.set(1.92, 0.08, 1.16);
  return mesh;
}

function MilkyWayScene({ isPaused, onPausedChange, showDust = true, showHalo = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02030a);
    scene.fog = new THREE.FogExp2(0x02030a, 0.0038);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2200);
    camera.position.set(-34, 16, 74);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    const releaseInteractionLock = lockSceneInteraction(container, renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.enablePan = false;
    controls.minDistance = 28;
    controls.maxDistance = 160;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.16;
    controls.maxPolarAngle = Math.PI * 0.92;

    scene.add(new THREE.AmbientLight(0x8390bf, 0.22));

    const coreLight = new THREE.PointLight(0xffdfb8, 26, 260, 1.45);
    scene.add(coreLight);

    const rimLight = new THREE.PointLight(0x90a8ff, 5.4, 300, 1.8);
    rimLight.position.set(-28, 14, 18);
    scene.add(rimLight);

    const starTexture = createParticleTexture();
    const nebulaTexture = createNebulaTexture();
    const backgroundStars = createBackgroundStars(starTexture);
    scene.add(backgroundStars);

    const galaxyGroup = new THREE.Group();
    galaxyGroup.rotation.x = -0.42;
    galaxyGroup.rotation.z = -0.34;
    scene.add(galaxyGroup);

    const galaxy = createGalaxyPoints(starTexture);
    galaxyGroup.add(galaxy);

    const armGlow = createArmGlow();
    galaxyGroup.add(armGlow);

    const centralBar = createCentralBar(starTexture);
    galaxyGroup.add(centralBar);

    const dustLane = createDustLane();
    galaxyGroup.add(dustLane);

    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: nebulaTexture,
        color: 0xffddba,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    coreGlow.scale.set(44, 44, 1);
    galaxyGroup.add(coreGlow);

    const outerHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: nebulaTexture,
        color: 0xc7d6ff,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    outerHalo.scale.set(140, 140, 1);
    galaxyGroup.add(outerHalo);

    const innerHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: nebulaTexture,
        color: 0xe7c8b1,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    innerHalo.scale.set(84, 84, 1);
    galaxyGroup.add(innerHalo);

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
      const elapsed = clock.getElapsedTime();
      controls.autoRotate = !isPaused;
      controls.update();
      dustLane.visible = showDust;
      outerHalo.visible = showHalo;
      innerHalo.visible = showHalo;

      if (!isPaused) {
        galaxy.rotation.y += 0.00065;
        galaxyGroup.rotation.z += 0.00022;
        backgroundStars.rotation.y += 0.00008;
        coreGlow.material.opacity = 0.88 + Math.sin(elapsed * 1.1) * 0.05;
        outerHalo.material.opacity = 0.24 + Math.sin(elapsed * 0.55) * 0.04;
        innerHalo.material.opacity = 0.1 + Math.sin(elapsed * 0.9) * 0.02;
        armGlow.rotation.z -= 0.00018;
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
      backgroundStars.geometry.dispose();
      backgroundStars.material.dispose();
      galaxy.geometry.dispose();
      galaxy.material.dispose();
      armGlow.geometry.dispose();
      armGlow.material.dispose();
      centralBar.geometry.dispose();
      centralBar.material.dispose();
      dustLane.geometry.dispose();
      dustLane.material.dispose();
      coreGlow.material.dispose();
      outerHalo.material.dispose();
      innerHalo.material.dispose();
      starTexture.dispose();
      nebulaTexture.dispose();
      renderer.dispose();
      releaseInteractionLock();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showDust, showHalo]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default MilkyWayScene;
