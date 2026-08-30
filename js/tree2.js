import * as THREE from "three";

function branchBetween(group, start, end, radius, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.65, radius, direction.length(), 8),
    material
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

export function createTree2() {
  const tree = new THREE.Group();
  tree.name = "Young garden tree";
  const windParts = [];

  const bark = new THREE.MeshStandardMaterial({ color: 0x806044, roughness: 0.98 });
  const darkLeaves = new THREE.MeshStandardMaterial({ color: 0x426f3c, roughness: 0.92, flatShading: true });
  const lightLeaves = new THREE.MeshStandardMaterial({ color: 0x709552, roughness: 0.92, flatShading: true });

  branchBetween(tree, new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.08, 4.7, 0.05), 0.56, bark);
  branchBetween(tree, new THREE.Vector3(-0.03, 3.25, 0), new THREE.Vector3(-1.25, 5.25, -0.25), 0.25, bark);
  branchBetween(tree, new THREE.Vector3(-0.02, 3.55, 0), new THREE.Vector3(1.18, 5.55, 0.2), 0.24, bark);
  branchBetween(tree, new THREE.Vector3(-0.05, 4.0, 0), new THREE.Vector3(0.2, 6.05, -0.4), 0.2, bark);

  const foliageGeometry = new THREE.IcosahedronGeometry(1.15, 2);
  const clusters = [
    [-1.25, 5.35, -0.2, 0.95], [1.15, 5.55, 0.2, 1], [0.1, 6.35, -0.35, 1.05],
    [-0.65, 6.15, 0.65, 0.83], [0.75, 6.35, 0.62, 0.78], [0, 5.3, 0.55, 0.86],
  ];

  clusters.forEach(([x, y, z, scale], index) => {
    const foliage = new THREE.Mesh(foliageGeometry, index % 3 === 0 ? lightLeaves : darkLeaves);
    foliage.position.set(x, y, z);
    foliage.scale.set(scale * 0.92, scale * 1.12, scale);
    foliage.rotation.y = index * 0.73;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    tree.add(foliage);
    foliage.userData.restRotationZ = foliage.rotation.z;
    windParts.push(foliage);
  });

  tree.userData.windParts = windParts;

  return tree;
}
