import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
  gradient.addColorStop(0, "rgba(255,245,225,1)");
  gradient.addColorStop(0.12, "rgba(255,180,70,0.95)");
  gradient.addColorStop(0.34, "rgba(255,110,20,0.5)");
  gradient.addColorStop(0.55, "rgba(120,60,255,0.18)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(210,225,255,0.72)");
  gradient.addColorStop(1, "rgba(210,225,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createAccretionTexture() {
  const size = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x / size - 0.5;
      const dy = y / size - 0.5;
      const radius = Math.sqrt(dx * dx + dy * dy) * 2;
      const angle = Math.atan2(dy, dx);
      const spiral = Math.sin(angle * 22 + radius * 68) * 0.5 + 0.5;
      const turbulence = Math.sin(dx * 34) * Math.cos(dy * 41) * 0.5 + 0.5;
      const noise = Math.random() * 0.3 + spiral * 0.45 + turbulence * 0.25;
      const falloff = Math.max(0, 1 - Math.pow(radius, 1.38));
      const brightness = noise * falloff;
      const index = (y * size + x) * 4;

      image.data[index] = 255;
      image.data[index + 1] = 80 + brightness * 160;
      image.data[index + 2] = 10 + brightness * 90;
      image.data[index + 3] = Math.floor(255 * brightness);
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStars() {
  const count = 10000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 90 + Math.random() * 620;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const tone = Math.random();
    colors[i * 3] = tone < 0.15 ? 0.7 : 1;
    colors[i * 3 + 1] = tone < 0.5 ? 0.86 : 0.95;
    colors[i * 3 + 2] = tone < 0.15 ? 1 : 0.84;
  }

  const starTexture = createStarTexture();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

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
      opacity: 0.92,
      alphaTest: 0.08,
    }),
  );
  points.userData.starTexture = starTexture;
  return points;
}

function createPlanet({ radius, color, position, ring = false }) {
  const group = new THREE.Group();
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshStandardMaterial({ color, roughness: 0.78 }),
  );
  group.add(planet);

  if (ring) {
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.52, radius * 0.06, 12, 96),
      new THREE.MeshBasicMaterial({
        color: 0xd8c7a0,
        transparent: true,
        opacity: 0.7,
      }),
    );
    ringMesh.rotation.x = Math.PI / 2.5;
    group.add(ringMesh);
  }

  group.position.copy(position);
  group.userData.planet = planet;
  return group;
}

function BlackHoleScene({ isPaused, onPausedChange, showPlanets = true, showStars = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010208);
    scene.fog = new THREE.FogExp2(0x010208, 0.0085);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1400);
    camera.position.set(0, 5.8, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 7;
    controls.maxDistance = 60;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    scene.add(new THREE.AmbientLight(0x29354d, 0.55));
    const warmLight = new THREE.PointLight(0xff9a2f, 7, 95, 1.6);
    warmLight.position.set(0, 3, 5);
    scene.add(warmLight);
    const coolLight = new THREE.PointLight(0x655dff, 2.5, 120, 1.8);
    coolLight.position.set(0, 0, -8);
    scene.add(coolLight);

    const stars = createStars();
    scene.add(stars);

    const accretionTexture = createAccretionTexture();
    const glowTexture = createGlowTexture();
    const blackHoleGroup = new THREE.Group();
    scene.add(blackHoleGroup);

    const eventHorizon = new THREE.Mesh(
      new THREE.SphereGeometry(2.18, 144, 144),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );
    blackHoleGroup.add(eventHorizon);

    const lensShell = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 96, 96),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        uniforms: { cameraPositionWorld: { value: camera.position.clone() } },
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
            gl_FragColor = vec4(color, fresnel * 0.24);
          }
        `,
      }),
    );
    blackHoleGroup.add(lensShell);

    const photonRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.32, 0.075, 32, 320),
      new THREE.MeshBasicMaterial({
        color: 0xffdfb8,
        transparent: true,
        opacity: 0.96,
      }),
    );
    photonRing.rotation.x = Math.PI / 2;
    blackHoleGroup.add(photonRing);

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
    hotGlow.scale.set(17, 17, 1);
    blackHoleGroup.add(hotGlow);

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
    coolGlow.scale.set(28, 28, 1);
    blackHoleGroup.add(coolGlow);

    const diskMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: accretionTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vec2 p = vUv - 0.5;
          float r = length(p) * 2.0;
          float angle = atan(p.y, p.x);

          float inner = smoothstep(0.19, 0.34, r);
          float outer = 1.0 - smoothstep(0.82, 1.05, r);
          float band = inner * outer;

          float warped = angle / 6.28318 + uTime * (0.14 / max(r, 0.24));
          vec2 sampleUv = vec2(warped, r * 1.9 - uTime * 0.12);
          vec4 tex = texture2D(uTexture, sampleUv);

          float hot = pow(max(0.0, 1.0 - abs(r - 0.36) * 2.7), 3.4);
          float mid = pow(max(0.0, 1.0 - abs(r - 0.55) * 2.2), 2.2);
          float doppler = smoothstep(-1.0, 1.0, sin(angle - 0.9)) * 1.45 + 0.3;

          vec3 cold = vec3(0.26, 0.05, 0.95);
          vec3 warm = vec3(1.0, 0.28, 0.02);
          vec3 whiteHot = vec3(1.0, 0.95, 0.72);

          vec3 color = mix(cold, warm, smoothstep(0.24, 0.8, r));
          color = mix(color, whiteHot, hot * 0.85 + mid * 0.2);
          color *= tex.rgb * (0.7 + doppler);

          float alpha = band * tex.a * (0.8 + hot * 1.3 + mid * 0.4);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const disk = new THREE.Mesh(
      new THREE.RingGeometry(2.46, 10.6, 520, 92),
      diskMaterial,
    );
    disk.rotation.x = Math.PI / 2.62;
    blackHoleGroup.add(disk);

    const secondaryDisk = new THREE.Mesh(
      new THREE.RingGeometry(2.62, 8.2, 360, 64),
      new THREE.MeshBasicMaterial({
        color: 0xff7b1a,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    secondaryDisk.rotation.x = Math.PI / 2.38;
    blackHoleGroup.add(secondaryDisk);

    const planets = [
      createPlanet({ radius: 0.66, color: 0x2f8cff, position: new THREE.Vector3(-9, 0, -9) }),
      createPlanet({ radius: 1.28, color: 0xc28a52, position: new THREE.Vector3(10, 0, -14) }),
      createPlanet({ radius: 0.86, color: 0x315bff, position: new THREE.Vector3(-14, 0, 7) }),
      createPlanet({ radius: 0.98, color: 0xd9b46f, position: new THREE.Vector3(13, 0, 5), ring: true }),
    ];
    planets.forEach((planet) => scene.add(planet));

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
      stars.visible = showStars;
      planets.forEach((planet) => {
        planet.visible = showPlanets;
      });
      lensShell.material.uniforms.cameraPositionWorld.value.copy(camera.position);

      if (!isPaused) {
        blackHoleGroup.rotation.y += 0.0018;
        disk.rotation.z -= 0.012;
        secondaryDisk.rotation.z += 0.004;
        diskMaterial.uniforms.uTime.value = time;
        stars.rotation.y += 0.00045;

        planets.forEach((planet, index) => {
          planet.rotation.y += 0.008 + index * 0.0015;
          planet.userData.planet.rotation.y += 0.01 + index * 0.002;
        });

        photonRing.scale.setScalar(1 + Math.sin(time * 2.2) * 0.018);
        hotGlow.material.opacity = 0.82 + Math.sin(time * 1.4) * 0.08;
        coolGlow.material.opacity = 0.18 + Math.sin(time * 0.8) * 0.04;
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
      stars.geometry.dispose();
      stars.material.map?.dispose();
      stars.material.dispose();
      accretionTexture.dispose();
      glowTexture.dispose();
      eventHorizon.geometry.dispose();
      eventHorizon.material.dispose();
      lensShell.geometry.dispose();
      lensShell.material.dispose();
      photonRing.geometry.dispose();
      photonRing.material.dispose();
      hotGlow.material.dispose();
      coolGlow.material.dispose();
      disk.geometry.dispose();
      diskMaterial.dispose();
      secondaryDisk.geometry.dispose();
      secondaryDisk.material.dispose();
      planets.forEach((planet) => {
        planet.userData.planet.geometry.dispose();
        planet.userData.planet.material.dispose();
        planet.children.forEach((child) => {
          if (child !== planet.userData.planet) {
            child.geometry?.dispose?.();
            child.material?.dispose?.();
          }
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isPaused, onPausedChange, showPlanets, showStars]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

export default BlackHoleScene;
