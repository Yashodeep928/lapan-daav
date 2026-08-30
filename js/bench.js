import * as THREE from "three";

function finish(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createBench() {
  const bench = new THREE.Group();
  bench.name = "Wooden garden bench";

  const wood = new THREE.MeshStandardMaterial({ color: 0x956038, roughness: 0.82 });
  const edgeWood = new THREE.MeshStandardMaterial({ color: 0x6e4127, roughness: 0.88 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x343b39, metalness: 0.48, roughness: 0.58 });

  for (let index = 0; index < 4; index += 1) {
    const slat = finish(new THREE.Mesh(new THREE.BoxGeometry(4, 0.16, 0.22), wood));
    slat.position.set(0, 1.08, -0.35 + index * 0.24);
    bench.add(slat);
  }

  for (let index = 0; index < 3; index += 1) {
    const slat = finish(new THREE.Mesh(new THREE.BoxGeometry(4, 0.26, 0.13), wood));
    slat.position.set(0, 1.48 + index * 0.34, -0.47);
    slat.rotation.x = -0.08;
    bench.add(slat);
  }

  [-1.48, 1.48].forEach((x) => {
    const rearLeg = finish(new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.72, 0.18), metal));
    rearLeg.position.set(x, 0.82, -0.42);
    rearLeg.rotation.x = -0.12;
    bench.add(rearLeg);

    const frontLeg = finish(new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, 0.18), metal));
    frontLeg.position.set(x, 0.52, 0.32);
    bench.add(frontLeg);

    const support = finish(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 1.08), metal));
    support.position.set(x, 0.92, -0.02);
    bench.add(support);

    const foot = finish(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.3), edgeWood));
    foot.position.set(x, 0.06, -0.35);
    bench.add(foot);
  });

  return bench;
}
