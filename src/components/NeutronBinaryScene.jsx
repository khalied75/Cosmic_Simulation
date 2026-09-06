import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createNeutronBinaryFabric } from "./NeutronBinaryFabric";
import { binaryState, MERGER_TIME, END_TIME } from "./neutronBinaryDynamics";
import { useSpacetimeFabric } from "./spacetimeFabricState";
import { lockSceneInteraction } from "./sceneInteractionLock";

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(.15, "rgba(180,240,255,.95)");
  gradient.addColorStop(.32, "rgba(70,150,255,.4)");
  gradient.addColorStop(.6, "rgba(120,50,255,.12)");
  gradient.addColorStop(1, "rgba(30,0,90,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export default function NeutronBinaryScene({ isPaused, onPausedChange, restart, speed, onStageChange }) {
  const host = useRef(null);
  const current = useRef({});
  const [failed, setFailed] = useState(false);
  const showFabric = useSpacetimeFabric("neutron-binary");
  useEffect(() => { current.current = { isPaused, onPausedChange, restart, speed, onStageChange, showFabric }; }, [isPaused, onPausedChange, restart, speed, onStageChange, showFabric]);

  useEffect(() => {
    const container = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
    catch { queueMicrotask(() => setFailed(true)); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x02030c);
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, .1, 400);
    camera.position.set(0, 10, 19);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 48;
    controls.maxPolarAngle = Math.PI * .49;
    controls.target.set(0, -1, 0);
    const unlock = lockSceneInteraction(container, renderer.domElement);
    const texture = glowTexture();
    const backgroundGeometry = new THREE.BufferGeometry();
    const backgroundPositions = new Float32Array(4200 * 3);
    for (let i = 0; i < backgroundPositions.length; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 2 - 1;
      const r = 70 + Math.random() * 90;
      backgroundPositions[i] = Math.cos(theta) * Math.sqrt(1 - y * y) * r;
      backgroundPositions[i + 1] = y * r;
      backgroundPositions[i + 2] = Math.sin(theta) * Math.sqrt(1 - y * y) * r;
    }
    backgroundGeometry.setAttribute("position", new THREE.BufferAttribute(backgroundPositions, 3));
    scene.add(new THREE.Points(backgroundGeometry, new THREE.PointsMaterial({ color: 0xbfcfff, size: .24, map: texture, transparent: true, depthWrite: false, opacity: .8 })));
    const fabric = createNeutronBinaryFabric();
    scene.add(fabric.group);

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `varying vec3 norm; varying vec3 pos;
        void main(){ norm=normalize(normalMatrix*normal); pos=position;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float time; varying vec3 norm; varying vec3 pos;
        void main(){
          float grain=sin(pos.x*42.+sin(pos.y*31.+time))*sin(pos.z*37.-time*.7);
          float edge=pow(1.-abs(norm.z),2.);
          vec3 c=mix(vec3(1.,.98,.87),vec3(.27,.65,1.),edge*.7)+grain*.065;
          gl_FragColor=vec4(c,1.);
        }`,
    });
    function makeStar(radius) {
      const group = new THREE.Group();
      const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), starMaterial);
      group.add(core);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: 0xa5ceff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: .8 }));
      halo.scale.setScalar(radius * 8);
      group.add(halo);
      scene.add(group);
      return group;
    }
    const stars = [makeStar(.62), makeStar(.62)];
    const remnant = makeStar(.79);
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: 0xd5c4ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    scene.add(flash);
    const debrisGeometry = new THREE.BufferGeometry();
    const debrisPositions = new Float32Array(1800 * 3);
    const seeds = Array.from({ length: 1800 }, () => ({ angle: Math.random() * Math.PI * 2, speed: .6 + Math.random() * 1.9, y: (Math.random() - .5) * .65 }));
    debrisGeometry.setAttribute("position", new THREE.BufferAttribute(debrisPositions, 3));
    const debris = new THREE.Points(debrisGeometry, new THREE.PointsMaterial({ color: 0xffbf93, size: .14, map: texture, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    debris.frustumCulled = false;
    scene.add(debris);
    // An illustrative post-merger polar outflow, not a pre-merger gravitational wave.
    const jets = new THREE.Group();
    for (const side of [-1, 1]) {
      const jet = new THREE.Mesh(new THREE.CylinderGeometry(.07, .65, 10, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x70dfff, transparent: true, opacity: .16, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      jet.position.y = side * 5;
      if (side < 0) jet.rotation.z = Math.PI;
      jets.add(jet);
    }
    jets.rotation.z = -.23;
    scene.add(jets);
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.fov = width < height ? 62 : 48;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const doubleClick = () => current.current.onPausedChange(!current.current.isPaused);
    renderer.domElement.addEventListener("dblclick", doubleClick);
    let elapsed = 0;
    let previous = performance.now();
    let restartSeen = current.current.restart;
    let lastStage = -1;
    let frame;
    const animate = now => {
      const state = current.current;
      const delta = Math.min((now - previous) / 1000, .05);
      previous = now;
      if (restartSeen !== state.restart) { elapsed = 0; restartSeen = state.restart; }
      if (!state.isPaused) elapsed = Math.min(END_TIME, elapsed + delta * state.speed);
      const { radius, phase } = binaryState(elapsed);
      const after = Math.max(0, elapsed - MERGER_TIME);
      const merge = THREE.MathUtils.smoothstep(after, 0, 1.3);
      const x = Math.cos(phase) * radius * (1 - merge);
      const z = Math.sin(phase) * radius * (1 - merge);
      stars.forEach((star, i) => {
        star.position.set(i ? -x : x, 0, i ? -z : z);
        star.visible = merge < 1;
        star.scale.setScalar(1 - merge * .65);
        star.rotation.y = phase;
      });
      remnant.visible = after > 0;
      remnant.scale.setScalar(merge * (1 + .035 * Math.sin(after * 16) * Math.exp(-after)));
      remnant.rotation.y = elapsed * 2;
      starMaterial.uniforms.time.value = elapsed;
      flash.material.opacity = after > 0 ? .7 * (1 - Math.exp(-after * 5)) * Math.exp(-after * .65) : 0;
      flash.scale.setScalar(6 + after * 2);
      debris.visible = after > 0;
      seeds.forEach((seed, i) => {
        const r = .8 + after * seed.speed;
        const theta = seed.angle + .45 * Math.log(1 + after);
        debrisPositions[i * 3] = Math.cos(theta) * r;
        debrisPositions[i * 3 + 1] = seed.y * after;
        debrisPositions[i * 3 + 2] = Math.sin(theta) * r;
      });
      debrisGeometry.attributes.position.needsUpdate = true;
      debris.material.opacity = Math.min(1, after) * Math.exp(-after * .17);
      jets.visible = after > .8;
      jets.scale.setScalar(Math.min(1, after / 3));
      fabric.group.visible = state.showFabric;
      fabric.update(elapsed, x, z, merge);
      const stage = elapsed < MERGER_TIME ? 0 : after < 2 ? 1 : 2;
      if (lastStage !== stage) { state.onStageChange(stage); lastStage = stage; }
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("dblclick", doubleClick);
      unlock();
      controls.dispose();
      const geometries = new Set();
      const materials = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} className="fixed inset-0" role="img" aria-label="ثنائي نيتروني — two neutron stars inspiraling and merging above spacetime">{failed && <p className="absolute inset-x-6 top-1/2 text-center text-indigo-100">تعذّر تشغيل العرض ثلاثي الأبعاد. WebGL is unavailable.</p>}</div>;
}
