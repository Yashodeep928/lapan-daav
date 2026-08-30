import * as THREE from "three";

function seeded(index) {
  const value = Math.sin(index * 78.233 + 19.17) * 43758.5453;
  return value - Math.floor(value);
}

function setInstance(mesh, index, x, y, z, scaleX, scaleY, scaleZ, rotationY = 0) {
  const transform = new THREE.Object3D();
  transform.position.set(x, y, z);
  transform.rotation.y = rotationY;
  transform.scale.set(scaleX, scaleY, scaleZ);
  transform.updateMatrix();
  mesh.setMatrixAt(index, transform.matrix);
}

function addWindShader(material, uniform, amplitude) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLandscapeWind = uniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uLandscapeWind;"
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        float landscapePhase = instanceMatrix[3].x * 0.11 + instanceMatrix[3].z * 0.09;
        transformed.x += sin(uLandscapeWind * 4.3 + landscapePhase) * ${(amplitude * 1.45).toFixed(3)};
        transformed.z += cos(uLandscapeWind * 3.6 + landscapePhase) * ${(amplitude * 0.78).toFixed(3)};`
      );
  };
  material.customProgramCacheKey = () => `landscape-wind-${amplitude}`;
}

function isProtectedArea(x, z) {
  const path = Math.abs(x) < 2.4 && z > -5.5 && z < 9;
  const house = Math.abs(x) < 5 && z > -12.5 && z < -4;
  const car = x > 3.5 && x < 11 && z > -5.5 && z < 1.5;
  const bench = x > -8.5 && x < -1.5 && z > 1.5 && z < 7;
  return path || house || car || bench;
}

export function createLandscape() {
  const landscape = new THREE.Group();
  landscape.name = "Full garden landscape";
  const windTime = { value: 0 };

  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x755238, roughness: 1 });
  const leafMaterialA = new THREE.MeshStandardMaterial({ color: 0x47783d, roughness: 0.94, flatShading: true });
  const leafMaterialB = new THREE.MeshStandardMaterial({ color: 0x628b49, roughness: 0.94, flatShading: true });
  addWindShader(leafMaterialA, windTime, 0.075);
  addWindShader(leafMaterialB, windTime, 0.09);

  const treeCount = 36;
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.34, 0.48, 4, 8),
    trunkMaterial,
    treeCount
  );
  const crownsA = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.35, 1), leafMaterialA, treeCount);
  const crownsB = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.05, 1), leafMaterialB, treeCount);

  for (let index = 0; index < treeCount; index += 1) {
    const ring = index < 10 ? 29 : index < 22 ? 42 : 54;
    const ringIndex = index < 10 ? index : index < 22 ? index - 10 : index - 22;
    const ringCount = index < 10 ? 10 : index < 22 ? 12 : 14;
    const angle = (ringIndex / ringCount) * Math.PI * 2 + (index % 2) * 0.13;
    const radius = ring + (seeded(index + 13) - 0.5) * 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const size = 0.52 + seeded(index + 37) * 0.72;
    const trunkHeight = 3.2 + size * 2.2;

    setInstance(trunks, index, x, trunkHeight / 2, z, size, trunkHeight / 4, size, angle);
    setInstance(crownsA, index, x, trunkHeight + 0.5 * size, z, size * 1.35, size, size * 1.25, angle);
    setInstance(
      crownsB,
      index,
      x + Math.sin(angle) * size,
      trunkHeight + 1.1 * size,
      z + Math.cos(angle) * size * 0.6,
      size,
      size * 0.84,
      size,
      angle + 0.7
    );
  }

  [trunks, crownsA, crownsB].forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    landscape.add(mesh);
  });

  const shrubMaterialA = new THREE.MeshStandardMaterial({ color: 0x37683b, roughness: 0.96, flatShading: true });
  const shrubMaterialB = new THREE.MeshStandardMaterial({ color: 0x5a8145, roughness: 0.96, flatShading: true });
  addWindShader(shrubMaterialA, windTime, 0.035);
  addWindShader(shrubMaterialB, windTime, 0.045);
  const shrubGeometry = new THREE.IcosahedronGeometry(0.8, 1);
  const shrubsA = new THREE.InstancedMesh(shrubGeometry, shrubMaterialA, 84);
  const shrubsB = new THREE.InstancedMesh(shrubGeometry, shrubMaterialB, 84);
  let shrubA = 0;
  let shrubB = 0;
  let sample = 0;

  while (shrubA + shrubB < 84) {
    const x = -56 + seeded(sample * 3 + 5) * 112;
    const z = -56 + seeded(sample * 3 + 19) * 112;
    sample += 1;
    if (isProtectedArea(x, z)) continue;
    const size = 0.55 + seeded(sample + 41) * 0.85;
    const mesh = sample % 2 === 0 ? shrubsA : shrubsB;
    const targetIndex = sample % 2 === 0 ? shrubA++ : shrubB++;
    setInstance(mesh, targetIndex, x, size * 0.62, z, size * 1.15, size * 0.72, size, seeded(sample + 71) * Math.PI);
  }
  shrubsA.count = shrubA;
  shrubsB.count = shrubB;

  [shrubsA, shrubsB].forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    landscape.add(mesh);
  });

  const stoneMaterialA = new THREE.MeshStandardMaterial({ color: 0x77756d, roughness: 1, flatShading: true });
  const stoneMaterialB = new THREE.MeshStandardMaterial({ color: 0x928777, roughness: 1, flatShading: true });
  const stoneGeometry = new THREE.DodecahedronGeometry(0.8, 0);
  const stonesA = new THREE.InstancedMesh(stoneGeometry, stoneMaterialA, 48);
  const stonesB = new THREE.InstancedMesh(stoneGeometry, stoneMaterialB, 48);
  let stoneA = 0;
  let stoneB = 0;
  sample = 0;

  while (stoneA + stoneB < 48) {
    const x = -55 + seeded(sample * 4 + 101) * 110;
    const z = -55 + seeded(sample * 4 + 149) * 110;
    sample += 1;
    if (isProtectedArea(x, z)) continue;
    const size = 0.55 + seeded(sample + 181) * 1.2;
    const mesh = sample % 2 === 0 ? stonesA : stonesB;
    const targetIndex = sample % 2 === 0 ? stoneA++ : stoneB++;
    setInstance(mesh, targetIndex, x, size * 0.42, z, size, size * 0.58, size * 0.82, seeded(sample + 223) * Math.PI);
  }
  stonesA.count = stoneA;
  stonesB.count = stoneB;

  [stonesA, stonesB].forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    landscape.add(mesh);
  });

  landscape.userData.windTime = windTime;
  return landscape;
}

export function updateLandscape(landscape, elapsed) {
  landscape.userData.windTime.value = elapsed;
}
