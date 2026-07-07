import * as THREE from "three";

export const fabricPresets = {
  earth: { size: 18, surfaceSegments: 130, gridLines: 18, curveSegments: 64, offsetY: -1.95, radius: 3.9, depth: 0.58, coreDepth: 0.16 },
  venus: { size: 18, surfaceSegments: 130, gridLines: 18, curveSegments: 64, offsetY: -1.95, radius: 4.0, depth: 0.66, coreDepth: 0.18 },
  mars: { size: 18, surfaceSegments: 130, gridLines: 18, curveSegments: 64, offsetY: -1.9, radius: 3.8, depth: 0.46, coreDepth: 0.12 },
  jupiter: { size: 24, surfaceSegments: 150, gridLines: 22, curveSegments: 72, offsetY: -2.2, radius: 4.9, depth: 1.12, coreDepth: 0.24 },
  saturn: { size: 24, surfaceSegments: 150, gridLines: 22, curveSegments: 72, offsetY: -2.2, radius: 4.8, depth: 0.95, coreDepth: 0.22 },
  uranus: { size: 20, surfaceSegments: 140, gridLines: 20, curveSegments: 68, offsetY: -2.0, radius: 4.15, depth: 0.78, coreDepth: 0.2 },
  neptune: { size: 20, surfaceSegments: 140, gridLines: 20, curveSegments: 68, offsetY: -2.0, radius: 4.2, depth: 0.82, coreDepth: 0.22 },
  sun: { size: 24, surfaceSegments: 150, gridLines: 22, curveSegments: 72, offsetY: -2.25, radius: 4.55, depth: 1.45, coreDepth: 0.38 },
  magnetar: { size: 28, surfaceSegments: 170, gridLines: 24, curveSegments: 76, offsetY: -2.05, radius: 4.25, depth: 2.28, coreDepth: 0.9 },
  "black-hole": { size: 32, surfaceSegments: 180, gridLines: 26, curveSegments: 82, offsetY: -2.15, radius: 4.8, depth: 3.25, coreDepth: 1.35 },
  "milky-way": { size: 2600, surfaceSegments: 120, gridLines: 24, curveSegments: 84, offsetY: -180, radius: 520, depth: 155, coreDepth: 70 },
};

function sampleFabricHeight(x, z, config) {
  const distance = Math.sqrt(x * x + z * z);
  const broad = Math.exp(-((distance * distance) / (config.radius * config.radius)));
  const coreRadius = config.radius * 0.42;
  const core = Math.exp(-((distance * distance) / (coreRadius * coreRadius)));
  const edgeLift = Math.exp(-(((distance - config.radius * 1.12) ** 2) / ((config.radius * 0.58) ** 2)));
  return -(config.depth * broad + config.coreDepth * core) + edgeLift * config.depth * 0.06;
}

function createSurfaceGeometry(config) {
  const geometry = new THREE.PlaneGeometry(
    config.size,
    config.size,
    config.surfaceSegments,
    config.surfaceSegments,
  );
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    positions.setY(index, sampleFabricHeight(x, z, config));
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createGridLines(config) {
  const group = new THREE.Group();
  const half = config.size / 2;
  const spacing = config.size / config.gridLines;
  const segments = config.curveSegments;

  for (let x = -half; x <= half + 0.001; x += spacing) {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const z = -half + (i / segments) * config.size;
      points.push(new THREE.Vector3(x, sampleFabricHeight(x, z, config), z));
    }
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0xf5f8ff,
          transparent: true,
          opacity: config.size > 200 ? 0.5 : 0.78,
        }),
      ),
    );
  }

  for (let z = -half; z <= half + 0.001; z += spacing) {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const x = -half + (i / segments) * config.size;
      points.push(new THREE.Vector3(x, sampleFabricHeight(x, z, config), z));
    }
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0xf5f8ff,
          transparent: true,
          opacity: config.size > 200 ? 0.5 : 0.78,
        }),
      ),
    );
  }

  return group;
}

export function createSpacetimeFabric(config) {
  const group = new THREE.Group();
  group.position.y = config.offsetY;

  const surface = new THREE.Mesh(
    createSurfaceGeometry(config),
    new THREE.MeshPhongMaterial({
      color: 0x081957,
      emissive: 0x0f2d7d,
      emissiveIntensity: config.size > 200 ? 0.22 : 0.34,
      transparent: true,
      opacity: config.size > 200 ? 0.28 : 0.4,
      side: THREE.DoubleSide,
      shininess: 18,
      specular: new THREE.Color(0x9fc8ff),
    }),
  );
  group.add(surface);
  group.add(createGridLines(config));

  return {
    group,
    dispose() {
      group.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
    },
  };
}
