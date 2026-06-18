import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useLanguage } from "../context/LanguageContext";

const ELEMENTS = [
  { id: "h", symbol: "H", name: { EN: "Hydrogen", AR: "الهيدروجين" }, protons: 1, neutrons: 0, electrons: 1, shells: [1], radius: "0.529 A", abundance: "73.5%" },
  { id: "he", symbol: "He", name: { EN: "Helium", AR: "الهيليوم" }, protons: 2, neutrons: 2, electrons: 2, shells: [2], radius: "0.310 A", abundance: "24.9%" },
  { id: "c", symbol: "C", name: { EN: "Carbon", AR: "الكربون" }, protons: 6, neutrons: 6, electrons: 6, shells: [2, 4], radius: "0.670 A", abundance: "0.29%" },
  { id: "o", symbol: "O", name: { EN: "Oxygen", AR: "الأكسجين" }, protons: 8, neutrons: 8, electrons: 8, shells: [2, 6], radius: "0.480 A", abundance: "0.77%" },
  { id: "ne", symbol: "Ne", name: { EN: "Neon", AR: "النيون" }, protons: 10, neutrons: 10, electrons: 10, shells: [2, 8], radius: "0.380 A", abundance: "0.12%" },
  { id: "si", symbol: "Si", name: { EN: "Silicon", AR: "السيليكون" }, protons: 14, neutrons: 14, electrons: 14, shells: [2, 8, 4], radius: "1.11 A", abundance: "0.07%" },
  { id: "fe", symbol: "Fe", name: { EN: "Iron", AR: "الحديد" }, protons: 26, neutrons: 30, electrons: 26, shells: [2, 8, 14, 2], radius: "1.26 A", abundance: "0.16%" },
];

const copy = {
  EN: {
    title: "Atomic Simulation",
    controls: "Controls",
    info: "Atomic Structure",
    speed: "Electron Speed",
    radius: "Orbit Radius",
    tilt: "Orbit Tilt",
    trail: "Orbit Trail",
    cloud: "Probability Cloud",
    soundPlay: "Play Sound",
    soundStop: "Stop Sound",
    closeView: "Close View",
    farView: "Far View",
    cloudView: "Cloud View",
    reset: "Reset View",
    model: "Model",
    modelValue: "Bohr Classic",
    protons: "Protons (+)",
    electrons: "Electrons (-)",
    neutrons: "Neutrons",
    bohrRadius: "Bohr Radius",
    elements: "Stellar Elements",
    bottom: "Drag to rotate | Mouse wheel to zoom | Educational atomic model",
    on: "ON",
    off: "OFF",
  },
  AR: {
    title: "محاكاة ذرية",
    controls: "التحكم",
    info: "التركيب الذري",
    speed: "سرعة الإلكترون",
    radius: "نصف قطر المدار",
    tilt: "إمالة المدار",
    trail: "أثر المدار",
    cloud: "سحابة احتمالية",
    soundPlay: "تشغيل الصوت",
    soundStop: "إيقاف الصوت",
    closeView: "منظر قريب",
    farView: "منظر بعيد",
    cloudView: "السحابة",
    reset: "إعادة تعيين",
    model: "النموذج",
    modelValue: "بور الكلاسيكي",
    protons: "البروتونات (+)",
    electrons: "الإلكترونات (-)",
    neutrons: "النيوترونات",
    bohrRadius: "نصف قطر بور",
    elements: "عناصر نجمية",
    bottom: "اسحب للتدوير | عجلة الماوس للتكبير | نموذج ذري تعليمي",
    on: "ON",
    off: "OFF",
  },
};

function makeGlowTexture(innerColor, outerColor, size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.4, outerColor);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSoftDot() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeChargeLabel(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 48px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 32, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    }),
  );
}

function AtomicStructureSimulation() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const soundRef = useRef({ audioCtx: null, oscillators: [] });
  const { language, isArabic } = useLanguage();
  const text = copy[language] ?? copy.EN;

  const [selectedElementId, setSelectedElementId] = useState("h");
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const [orbitRadius, setOrbitRadius] = useState(1);
  const [orbitTiltDeg, setOrbitTiltDeg] = useState(25);
  const [trailOn, setTrailOn] = useState(true);
  const [cloudOn, setCloudOn] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [mobilePanel, setMobilePanel] = useState("controls");
  const [elementsMenuOpen, setElementsMenuOpen] = useState(false);
  const [mobilePanelExpanded, setMobilePanelExpanded] = useState(false);

  const selectedElement = useMemo(
    () => ELEMENTS.find((element) => element.id === selectedElementId) ?? ELEMENTS[0],
    [selectedElementId],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x223344, 1.2);
    const keyLight = new THREE.PointLight(0xffffff, 1.5, 100);
    keyLight.position.set(15, 20, 15);
    scene.add(ambientLight, keyLight);

    const protonGlowTexture = makeGlowTexture("rgba(255,120,80,0.9)", "rgba(255,60,20,0.25)");
    const electronGlowTexture = makeGlowTexture("rgba(150,220,255,0.95)", "rgba(60,160,255,0.3)");
    const backgroundProtonTexture = makeGlowTexture("rgba(255,140,100,0.8)", "rgba(255,60,20,0.15)");
    const backgroundElectronTexture = makeGlowTexture("rgba(160,220,255,0.85)", "rgba(60,160,255,0.2)");
    const softDot = makeSoftDot();

    const protonGroup = new THREE.Group();
    const orbitTiltGroup = new THREE.Group();
    const shellLines = [];
    const electronGroup = new THREE.Group();
    const trailGroup = new THREE.Group();
    const backgroundGroup = new THREE.Group();
    scene.add(protonGroup, orbitTiltGroup, electronGroup, trailGroup, backgroundGroup);

    const plusLabel = makeChargeLabel("+", "#ffffff");
    plusLabel.scale.set(1.4, 1.4, 1);
    protonGroup.add(plusLabel);

    const starfieldGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i += 1) {
      const radius = 1500 + Math.random() * 1500;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      starPositions[i * 3 + 1] = radius * Math.cos(theta);
      starPositions[i * 3 + 2] = radius * Math.sin(theta) * Math.sin(phi);
    }
    starfieldGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starfield = new THREE.Points(
      starfieldGeometry,
      new THREE.PointsMaterial({
        color: 0x99aacc,
        size: 1,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    scene.add(starfield);

    const bgAtoms = [];
    for (let i = 0; i < 45; i += 1) {
      const group = new THREE.Group();
      const distance = 60 + Math.random() * 800;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      group.position.set(
        distance * Math.sin(theta) * Math.cos(phi),
        distance * Math.cos(theta),
        distance * Math.sin(theta) * Math.sin(phi),
      );

      const scale = 0.3 + Math.random() * 1.4;
      const protonSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: backgroundProtonTexture,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.5 + Math.random() * 0.3,
        }),
      );
      protonSprite.scale.set(scale * 1.6, scale * 1.6, 1);
      group.add(protonSprite);

      const electronSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: backgroundElectronTexture,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.4 + Math.random() * 0.4,
        }),
      );
      electronSprite.scale.set(scale * 0.6, scale * 0.6, 1);
      group.add(electronSprite);
      backgroundGroup.add(group);

      bgAtoms.push({
        electronSprite,
        orbitRadius: scale * (1.8 + Math.random() * 1.2),
        orbitSpeed: 0.3 + Math.random() * 1.2,
        orbitPhase: Math.random() * Math.PI * 2,
        tilt: Math.random() * Math.PI,
        tiltAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      });
    }

    const spherical = { theta: 0.6, phi: Math.PI / 2.6, r: 35 };
    const updateCamera = () => {
      camera.position.x = spherical.r * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.y = spherical.r * Math.cos(spherical.phi);
      camera.position.z = spherical.r * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.lookAt(0, 0, 0);
    };

    const animateTo = (theta, phi, r, duration = 1000) => {
      const start = { theta: spherical.theta, phi: spherical.phi, r: spherical.r };
      const target = { theta, phi, r };
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - ((-2 * progress + 2) ** 2) / 2;
        spherical.theta = start.theta + (target.theta - start.theta) * eased;
        spherical.phi = start.phi + (target.phi - start.phi) * eased;
        spherical.r = start.r + (target.r - start.r) * eased;
        updateCamera();
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (event) => {
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (event) => {
      if (!isDragging) return;
      spherical.theta -= (event.clientX - lastX) * 0.005;
      spherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, spherical.phi - (event.clientY - lastY) * 0.005));
      lastX = event.clientX;
      lastY = event.clientY;
      updateCamera();
    };
    const onWheel = (event) => {
      spherical.r = Math.max(3, Math.min(1200, spherical.r + event.deltaY * 0.03));
      updateCamera();
    };
    const onTouchStart = (event) => {
      isDragging = true;
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    const onTouchMove = (event) => {
      if (!isDragging) return;
      spherical.theta -= (event.touches[0].clientX - lastX) * 0.005;
      spherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, spherical.phi - (event.touches[0].clientY - lastY) * 0.005));
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
      updateCamera();
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("wheel", onWheel);
    renderer.domElement.addEventListener("touchstart", onTouchStart);
    renderer.domElement.addEventListener("touchend", onTouchEnd);
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });

    const atomState = {
      probabilityCloud: null,
      electronEntries: [],
      orbitBaseRadius: 12,
    };

    const clearGroup = (group) => {
      while (group.children.length) {
        const child = group.children.pop();
        child.geometry?.dispose?.();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.map?.dispose?.();
            material.dispose?.();
          });
        } else {
          child.material?.map?.dispose?.();
          child.material?.dispose?.();
        }
      }
    };

    const buildProbabilityCloud = (radius) => {
      if (atomState.probabilityCloud) {
        scene.remove(atomState.probabilityCloud);
        atomState.probabilityCloud.geometry.dispose();
        atomState.probabilityCloud.material.map?.dispose?.();
        atomState.probabilityCloud.material.dispose();
      }

      const count = 6000;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        let cloudRadius;
        do {
          cloudRadius = -Math.log(Math.random()) * radius * 0.7;
        } while (
          Math.random() > (cloudRadius * cloudRadius) / ((radius * 1.2) * (radius * 1.2)) &&
          cloudRadius < radius * 3
        );
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = 2 * Math.PI * Math.random();
        positions[i * 3] = cloudRadius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = cloudRadius * Math.cos(theta);
        positions[i * 3 + 2] = cloudRadius * Math.sin(theta) * Math.sin(phi);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: 0x66bbff,
        size: 0.12,
        map: softDot,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      atomState.probabilityCloud = new THREE.Points(geometry, material);
      atomState.probabilityCloud.visible = cloudOn;
      scene.add(atomState.probabilityCloud);
    };

    const populateAtom = (element, radiusScale, tiltRadians) => {
      clearGroup(protonGroup);
      protonGroup.add(plusLabel);
      plusLabel.position.set(0, 0, 0);
      clearGroup(orbitTiltGroup);
      clearGroup(electronGroup);
      clearGroup(trailGroup);
      atomState.electronEntries = [];
      shellLines.length = 0;

      const totalNucleons = element.protons + element.neutrons;
      const nucleusDistance = Math.max(0, Math.cbrt(totalNucleons) * 0.55);
      const nucleonRadius = totalNucleons > 1 ? 0.4 : 1.2;

      const addNucleon = (color, emissive) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(nucleonRadius, 24, 24),
          new THREE.MeshPhongMaterial({
            color,
            emissive,
            emissiveIntensity: 0.5,
            shininess: 80,
            specular: 0xffaaaa,
          }),
        );

        if (totalNucleons === 1) {
          mesh.position.set(0, 0, 0);
        } else {
          const theta = Math.acos(2 * Math.random() - 1);
          const phi = 2 * Math.PI * Math.random();
          const radius = Math.cbrt(Math.random()) * nucleusDistance;
          mesh.position.set(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.cos(theta),
            radius * Math.sin(theta) * Math.sin(phi),
          );
        }
        protonGroup.add(mesh);
      };

      for (let i = 0; i < element.protons; i += 1) addNucleon(0xff5544, 0xaa1100);
      for (let i = 0; i < element.neutrons; i += 1) addNucleon(0x8f96a3, 0x2c3443);

      const protonGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: protonGlowTexture,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
        }),
      );
      const glowScale = totalNucleons === 1 ? 8.4 : Math.max(7, nucleusDistance * 8);
      protonGlow.scale.set(glowScale, glowScale, 1);
      protonGroup.add(protonGlow);

      element.shells.forEach((count, shellIndex) => {
        const shellRadius = atomState.orbitBaseRadius * radiusScale * (1 + shellIndex * 0.7);
        const curve = new THREE.EllipseCurve(0, 0, shellRadius, shellRadius, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(128).map((point) => new THREE.Vector3(point.x, 0, point.y));
        const shellGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const shellMaterial = new THREE.LineBasicMaterial({
          color: 0x4488cc,
          transparent: true,
          opacity: Math.max(0.18, 0.35 - shellIndex * 0.05),
        });
        const orbitRing = new THREE.LineLoop(shellGeometry, shellMaterial);
        orbitRing.rotation.z = shellIndex * 0.35;
        orbitTiltGroup.add(orbitRing);
        shellLines.push(orbitRing);

        for (let electronIndex = 0; electronIndex < count; electronIndex += 1) {
          const group = new THREE.Group();
          const electronCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 20, 20),
            new THREE.MeshPhongMaterial({
              color: 0x55ccff,
              emissive: 0x2299ff,
              emissiveIntensity: 0.8,
              shininess: 100,
            }),
          );
          group.add(electronCore);

          const electronGlow = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: electronGlowTexture,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              transparent: true,
            }),
          );
          electronGlow.scale.set(1.8, 1.8, 1);
          group.add(electronGlow);

          const minusLabel = makeChargeLabel("-", "#ffffff");
          minusLabel.scale.set(0.5, 0.5, 1);
          group.add(minusLabel);

          electronGroup.add(group);

          const trailGeometry = new THREE.BufferGeometry();
          const trailPositions = new Float32Array(80 * 3);
          trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
          const trailLine = new THREE.Line(
            trailGeometry,
            new THREE.LineBasicMaterial({
              color: 0x66ccff,
              transparent: true,
              opacity: 0.5,
            }),
          );
          trailGroup.add(trailLine);

          atomState.electronEntries.push({
            group,
            trailLine,
            trailPoints: [],
            shellRadius,
            shellIndex,
            angle: (electronIndex / count) * Math.PI * 2,
            rotationZ: shellIndex * 0.35,
            speed: 1 + shellIndex * 0.28 + electronIndex * 0.02,
          });
        }
      });

      orbitTiltGroup.rotation.x = tiltRadians;
      buildProbabilityCloud(atomState.orbitBaseRadius * radiusScale);
    };

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    sceneRef.current = {
      scene,
      camera,
      renderer,
      starfield,
      protonGroup,
      orbitTiltGroup,
      electronGroup,
      trailGroup,
      bgAtoms,
      atomState,
      spherical,
      updateCamera,
      animateTo,
      populateAtom,
      resize,
      textures: [protonGlowTexture, electronGlowTexture, backgroundProtonTexture, backgroundElectronTexture, softDot],
    };

    populateAtom(selectedElement, orbitRadius, THREE.MathUtils.degToRad(orbitTiltDeg));
    updateCamera();
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;
    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const api = sceneRef.current;

      api.atomState.electronEntries.forEach((entry) => {
        entry.angle += delta * orbitSpeed * 2.2 * entry.speed;
        const x = entry.shellRadius * Math.cos(entry.angle);
        const z = entry.shellRadius * Math.sin(entry.angle);
        const local = new THREE.Vector3(x, 0, z);
        local.applyAxisAngle(new THREE.Vector3(0, 0, 1), entry.rotationZ);
        local.applyAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(orbitTiltDeg));
        entry.group.position.copy(local);

        if (trailOn && !cloudOn) {
          entry.trailPoints.push(local.clone());
          if (entry.trailPoints.length > 80) entry.trailPoints.shift();
          const positions = entry.trailLine.geometry.attributes.position.array;
          for (let i = 0; i < entry.trailPoints.length; i += 1) {
            positions[i * 3] = entry.trailPoints[i].x;
            positions[i * 3 + 1] = entry.trailPoints[i].y;
            positions[i * 3 + 2] = entry.trailPoints[i].z;
          }
          entry.trailLine.geometry.setDrawRange(0, entry.trailPoints.length);
          entry.trailLine.geometry.attributes.position.needsUpdate = true;
        } else {
          entry.trailPoints.length = 0;
          entry.trailLine.geometry.setDrawRange(0, 0);
        }
      });

      api.protonGroup.children.forEach((child, index) => {
        if (index === 0) return;
        if (child.isMesh) {
          const pulse = 1 + 0.04 * Math.sin(elapsed * 1.5);
          child.scale.setScalar(pulse);
        }
      });

      const glow = api.protonGroup.children.find((child) => child.isSprite && child !== plusLabel);
      if (glow?.material) {
        glow.material.opacity = 0.8 + 0.1 * Math.sin(elapsed * 1.5);
      }

      api.electronGroup.visible = !cloudOn;
      api.orbitTiltGroup.visible = !cloudOn;
      api.trailGroup.visible = !cloudOn && trailOn;
      if (api.atomState.probabilityCloud) api.atomState.probabilityCloud.visible = cloudOn;

      api.bgAtoms.forEach((atom) => {
        const angle = elapsed * atom.orbitSpeed + atom.orbitPhase;
        const position = new THREE.Vector3(atom.orbitRadius * Math.cos(angle), 0, atom.orbitRadius * Math.sin(angle));
        position.applyAxisAngle(atom.tiltAxis, atom.tilt);
        atom.electronSprite.position.copy(position);
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);

      soundRef.current.oscillators.forEach(({ gain, osc }) => {
        gain.gain.value = 0;
        try {
          osc.stop();
        } catch {}
      });
      soundRef.current.oscillators = [];

      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            material.map?.dispose?.();
            material.dispose?.();
          });
        } else {
          object.material?.map?.dispose?.();
          object.material?.dispose?.();
        }
      });
      starfieldGeometry.dispose();
      sceneRef.current.textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const api = sceneRef.current;
    if (!api) return;
    api.populateAtom(selectedElement, orbitRadius, THREE.MathUtils.degToRad(orbitTiltDeg));
  }, [selectedElement, orbitRadius, orbitTiltDeg]);

  useEffect(() => {
    const api = sceneRef.current;
    if (!api) return;
    api.orbitTiltGroup.rotation.x = THREE.MathUtils.degToRad(orbitTiltDeg);
    if (api.atomState.probabilityCloud) api.atomState.probabilityCloud.visible = cloudOn;
  }, [orbitTiltDeg, cloudOn]);

  useEffect(() => {
    const { audioCtx, oscillators } = soundRef.current;
    if (!audioCtx || oscillators.length === 0) return;
    oscillators.forEach(({ osc }, index) => {
      osc.frequency.value = 110 * (index + 1) * (0.7 + orbitSpeed * 0.3);
    });
  }, [orbitSpeed]);

  useEffect(() => {
    return () => {
      if (soundRef.current.audioCtx?.state !== "closed") {
        soundRef.current.audioCtx?.close?.();
      }
    };
  }, []);

  const toggleSound = async () => {
    if (!soundRef.current.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      soundRef.current.audioCtx = new AudioContextClass();
    }

    const { audioCtx } = soundRef.current;
    if (audioCtx.state === "suspended") await audioCtx.resume();

    if (!soundOn) {
      const freqs = [110, 165, 220];
      soundRef.current.oscillators = freqs.map((base, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = base * (0.7 + orbitSpeed * 0.3);
        gain.gain.value = 0.025 / (index + 1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        return { osc, gain };
      });
    } else {
      soundRef.current.oscillators.forEach(({ gain, osc }) => {
        gain.gain.value = 0;
        try {
          osc.stop();
        } catch {}
      });
      soundRef.current.oscillators = [];
    }

    setSoundOn((value) => !value);
  };

  const animateCamera = (type) => {
    const api = sceneRef.current;
    if (!api) return;
    if (type === "close") api.animateTo(api.spherical.theta, Math.PI / 2.6, 10);
    if (type === "far") api.animateTo(api.spherical.theta, Math.PI / 2.6, 250);
    if (type === "reset") api.animateTo(0.6, Math.PI / 2.6, 35);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white" dir={isArabic ? "rtl" : "ltr"}>
      <div className="absolute inset-0" ref={containerRef} />

      {/* ========== MOBILE PANEL (up to 768px) ========== */}
      <div className="fixed inset-x-0 top-16 z-20 lg:hidden">
        <div className="mx-2 sm:mx-3">
          {/* Sound Button + Elements Menu Button */}
          <div className="mb-2 flex justify-center gap-2">
            <button
              className="rounded-full border border-white/18 bg-black/42 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-black/35 backdrop-blur-2xl transition hover:bg-white/10"
              onClick={toggleSound}
              type="button"
            >
              {soundOn ? text.soundStop : text.soundPlay}
            </button>
            <button
              className="rounded-full border border-white/18 bg-black/42 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-black/35 backdrop-blur-2xl transition hover:bg-white/10"
              onClick={() => setElementsMenuOpen(true)}
              type="button"
            >
              {selectedElement.symbol}
            </button>
          </div>

          {/* Collapsible Controls Button */}
          <div className="mb-2 flex rounded-2xl border border-white/12 bg-black/42 p-2 sm:p-3 shadow-2xl shadow-black/45 backdrop-blur-2xl">
            <button
              className="flex-1 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] transition border-sky-300 bg-sky-300/18 text-sky-100 flex items-center justify-between"
              onClick={() => setMobilePanelExpanded(!mobilePanelExpanded)}
              type="button"
            >
              <span>{text.controls}</span>
              <span className={`transition-transform ${mobilePanelExpanded ? "rotate-180" : ""}`}>▼</span>
            </button>
            <button
              className={`flex-1 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] transition ${
                mobilePanel === "info"
                  ? "border-sky-300 bg-sky-300/18 text-sky-100"
                  : "border-white/14 bg-white/[0.03] text-white/70"
              }`}
              onClick={() => {
                setMobilePanel("info");
                setMobilePanelExpanded(true);
              }}
              type="button"
            >
              {text.info}
            </button>
          </div>

          {/* Expandable Controls Panel */}
          {mobilePanelExpanded && mobilePanel === "controls" && (
            <div className="mb-2 animate-in fade-in slide-in-from-top-2 rounded-xl border border-white/8 bg-black/20 p-2.5 sm:p-3">
              <div className="mb-2.5 sm:mb-3">
                <div className="mb-1 flex justify-between text-[11px] sm:text-xs text-slate-300">
                  <span>{text.speed}</span>
                  <span>{orbitSpeed.toFixed(2)}</span>
                </div>
                <input className="w-full accent-sky-300" max="4" min="0" onChange={(event) => setOrbitSpeed(Number(event.target.value))} step="0.05" type="range" value={orbitSpeed} />
              </div>

              <div className="mb-2.5 sm:mb-3">
                <div className="mb-1 flex justify-between text-[11px] sm:text-xs text-slate-300">
                  <span>{text.radius}</span>
                  <span>{orbitRadius.toFixed(2)}</span>
                </div>
                <input className="w-full accent-sky-300" max="2.5" min="0.5" onChange={(event) => setOrbitRadius(Number(event.target.value))} step="0.05" type="range" value={orbitRadius} />
              </div>

              <div className="mb-2.5 sm:mb-3">
                <div className="mb-1 flex justify-between text-[11px] sm:text-xs text-slate-300">
                  <span>{text.tilt}</span>
                  <span>{orbitTiltDeg}°</span>
                </div>
                <input className="w-full accent-sky-300" max="90" min="0" onChange={(event) => setOrbitTiltDeg(Number(event.target.value))} step="1" type="range" value={orbitTiltDeg} />
              </div>

              <div className="mb-2.5 sm:mb-3">
                <div className="mb-1 flex justify-between text-[11px] sm:text-xs text-slate-300">
                  <span>{text.trail}</span>
                  <span>{trailOn ? text.on : text.off}</span>
                </div>
                <input className="w-full accent-sky-300" max="1" min="0" onChange={(event) => setTrailOn(Number(event.target.value) === 1)} step="1" type="range" value={trailOn ? 1 : 0} />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px] sm:text-xs text-slate-300">
                  <span>{text.cloud}</span>
                  <span>{cloudOn ? text.on : text.off}</span>
                </div>
                <input className="w-full accent-sky-300" max="1" min="0" onChange={(event) => setCloudOn(Number(event.target.value) === 1)} step="1" type="range" value={cloudOn ? 1 : 0} />
              </div>
            </div>
          )}

          {/* Expandable Info Panel */}
          {mobilePanelExpanded && mobilePanel === "info" && (
            <div className="mb-2 animate-in fade-in slide-in-from-top-2 rounded-xl border border-white/8 bg-black/20 p-2.5 sm:p-3 text-xs sm:text-sm leading-6 sm:leading-7 text-slate-300">
              <h2 className="mb-2 sm:mb-3 text-xs sm:text-sm tracking-[0.12em] text-sky-200">{selectedElement.symbol} {selectedElement.name[language]}</h2>
              <div className="flex justify-between gap-2 text-[11px] sm:text-xs"><span>{text.protons}</span><span className="font-semibold text-white">{selectedElement.protons}</span></div>
              <div className="flex justify-between gap-2 text-[11px] sm:text-xs"><span>{text.electrons}</span><span className="font-semibold text-white">{selectedElement.electrons}</span></div>
              <div className="flex justify-between gap-2 text-[11px] sm:text-xs"><span>{text.neutrons}</span><span className="font-semibold text-white">{selectedElement.neutrons}</span></div>
              <div className="flex justify-between gap-2 text-[11px] sm:text-xs"><span>{text.model}</span><span className="font-semibold text-white">{text.modelValue}</span></div>
              <div className="flex justify-between gap-2 text-[11px] sm:text-xs"><span>{text.bohrRadius}</span><span className="font-semibold text-white">{selectedElement.radius}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* ========== DESKTOP CONTROLS PANEL (1024px+) ========== */}
      <div className={`fixed top-20 z-20 hidden w-[240px] lg:w-[260px] rounded-2xl border border-white/12 bg-black/42 p-3 lg:p-4 shadow-2xl shadow-black/45 backdrop-blur-2xl lg:block ${isArabic ? "right-4 lg:right-5" : "left-4 lg:left-5"}`}>
        <h2 className="mb-3 lg:mb-4 border-b border-sky-300/20 pb-2 text-xs lg:text-sm uppercase tracking-[0.18em] text-sky-200">{text.controls}</h2>

        <div className="mb-2.5 lg:mb-3">
          <div className="mb-1 flex justify-between text-xs text-slate-300">
            <span>{text.speed}</span>
            <span>{orbitSpeed.toFixed(2)}</span>
          </div>
          <input className="w-full accent-sky-300" max="4" min="0" onChange={(event) => setOrbitSpeed(Number(event.target.value))} step="0.05" type="range" value={orbitSpeed} />
        </div>

        <div className="mb-2.5 lg:mb-3">
          <div className="mb-1 flex justify-between text-xs text-slate-300">
            <span>{text.radius}</span>
            <span>{orbitRadius.toFixed(2)}</span>
          </div>
          <input className="w-full accent-sky-300" max="2.5" min="0.5" onChange={(event) => setOrbitRadius(Number(event.target.value))} step="0.05" type="range" value={orbitRadius} />
        </div>

        <div className="mb-2.5 lg:mb-3">
          <div className="mb-1 flex justify-between text-xs text-slate-300">
            <span>{text.tilt}</span>
            <span>{orbitTiltDeg}°</span>
          </div>
          <input className="w-full accent-sky-300" max="90" min="0" onChange={(event) => setOrbitTiltDeg(Number(event.target.value))} step="1" type="range" value={orbitTiltDeg} />
        </div>

        <div className="mb-2.5 lg:mb-3">
          <div className="mb-1 flex justify-between text-xs text-slate-300">
            <span>{text.trail}</span>
            <span>{trailOn ? text.on : text.off}</span>
          </div>
          <input className="w-full accent-sky-300" max="1" min="0" onChange={(event) => setTrailOn(Number(event.target.value) === 1)} step="1" type="range" value={trailOn ? 1 : 0} />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-300">
            <span>{text.cloud}</span>
            <span>{cloudOn ? text.on : text.off}</span>
          </div>
          <input className="w-full accent-sky-300" max="1" min="0" onChange={(event) => setCloudOn(Number(event.target.value) === 1)} step="1" type="range" value={cloudOn ? 1 : 0} />
        </div>
      </div>

      {/* ========== DESKTOP INFO PANEL (1024px+) ========== */}
      <div className={`fixed top-20 z-20 hidden max-w-[240px] lg:max-w-[260px] rounded-2xl border border-white/12 bg-black/42 p-3 lg:p-4 text-xs lg:text-sm leading-6 lg:leading-7 text-slate-300 shadow-2xl shadow-black/45 backdrop-blur-2xl lg:block ${isArabic ? "left-4 lg:left-5" : "right-4 lg:right-5"}`}>
        <h2 className="mb-2 lg:mb-3 text-xs lg:text-sm tracking-[0.12em] text-sky-200">{selectedElement.symbol} {selectedElement.name[language]}</h2>
        <div className="flex justify-between gap-3 text-xs"><span>{text.protons}</span><span className="font-semibold text-white">{selectedElement.protons}</span></div>
        <div className="flex justify-between gap-3 text-xs"><span>{text.electrons}</span><span className="font-semibold text-white">{selectedElement.electrons}</span></div>
        <div className="flex justify-between gap-3 text-xs"><span>{text.neutrons}</span><span className="font-semibold text-white">{selectedElement.neutrons}</span></div>
        <div className="flex justify-between gap-3 text-xs"><span>{text.model}</span><span className="font-semibold text-white">{text.modelValue}</span></div>
        <div className="flex justify-between gap-3 text-xs"><span>{text.bohrRadius}</span><span className="font-semibold text-white">{selectedElement.radius}</span></div>
      </div>

      {/* ========== SOUND BUTTON DESKTOP (1024px+) ========== */}
      <button
        className="fixed top-20 z-20 hidden rounded-full border border-white/18 bg-black/42 px-4 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-semibold text-white shadow-xl shadow-black/35 backdrop-blur-2xl transition hover:bg-white/10 lg:block left-1/2 -translate-x-1/2"
        onClick={toggleSound}
        type="button"
      >
        {soundOn ? text.soundStop : text.soundPlay}
      </button>

      {/* ========== ACTION BUTTONS (All screens) ========== */}
      <div className="fixed bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-16 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-1.5rem)] lg:max-w-[90vw] -translate-x-1/2 flex-wrap justify-center gap-1.5 sm:gap-2">
        <button className="rounded-full border border-white/55 bg-black/55 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10" onClick={() => animateCamera("close")} type="button">
          {text.closeView}
        </button>
        <button className="rounded-full border border-white/55 bg-black/55 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10" onClick={() => animateCamera("far")} type="button">
          {text.farView}
        </button>
        <button className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 ${cloudOn ? "border-sky-300 bg-sky-300/20 text-sky-100" : "border-white/55 bg-black/55 hover:border-white hover:bg-white/10"}`} onClick={() => setCloudOn((value) => !value)} type="button">
          {text.cloudView}
        </button>
        <button className="rounded-full border border-white/55 bg-black/55 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10" onClick={() => animateCamera("reset")} type="button">
          {text.reset}
        </button>
      </div>

      {/* ========== ELEMENTS MODAL - MOBILE (up to 768px) ========== */}
      {elementsMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setElementsMenuOpen(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Escape" && setElementsMenuOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-x-2 top-1/2 z-40 w-auto -translate-y-1/2 lg:hidden">
            <div className="mx-auto max-w-sm rounded-2xl border border-white/12 bg-black/80 shadow-2xl shadow-black/60 backdrop-blur-xl">
              {/* Header */}
              <div className="border-b border-white/8 p-3 sm:p-4 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-white uppercase tracking-[0.12em]">{text.elements}</h3>
                <button
                  className="text-white/60 hover:text-white transition text-xl"
                  onClick={() => setElementsMenuOpen(false)}
                  type="button"
                >
                  ×
                </button>
              </div>

              {/* Elements Grid */}
              <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ELEMENTS.map((element) => (
                    <button
                      className={`rounded-lg border px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold backdrop-blur-md transition ${
                        selectedElementId === element.id
                          ? "border-sky-300 bg-sky-300/25 text-sky-100 shadow-lg shadow-sky-300/20"
                          : "border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
                      }`}
                      key={element.id}
                      onClick={() => {
                        setSelectedElementId(element.id);
                        setElementsMenuOpen(false);
                      }}
                      type="button"
                    >
                      <div className="font-bold">{element.symbol}</div>
                      <div className="text-[9px] sm:text-[10px] text-white/60 line-clamp-1">{element.name[language]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== ELEMENTS SELECTOR - DESKTOP (1024px+) ========== */}
      <div className="fixed bottom-32 left-1/2 z-20 hidden max-w-[92vw] lg:max-w-[85vw] -translate-x-1/2 flex-wrap justify-center gap-2 lg:flex">
        {ELEMENTS.map((element) => (
          <button
            className={`rounded-full border px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold backdrop-blur-md transition ${selectedElementId === element.id ? "border-sky-300 bg-sky-300/20 text-sky-100" : "border-white/25 bg-black/45 text-white hover:border-white/70 hover:bg-white/10"}`}
            key={element.id}
            onClick={() => setSelectedElementId(element.id)}
            type="button"
          >
            {element.symbol} {element.name[language]}
          </button>
        ))}
      </div>

      {/* ========== BOTTOM INSTRUCTION TEXT ========== */}
      <div className="fixed bottom-1.5 sm:bottom-2 left-1/2 z-20 w-[min(95vw,360px)] sm:w-[min(92vw,400px)] -translate-x-1/2 rounded-lg sm:rounded-xl border border-white/12 bg-black/42 px-2.5 sm:px-4 py-1.5 sm:py-2 text-center text-[9px] sm:text-[10px] tracking-[0.08em] sm:tracking-[0.1em] text-slate-400 shadow-xl shadow-black/35 backdrop-blur-2xl">
        {text.bottom}
      </div>
    </section>
  );
}

export default AtomicStructureSimulation;
