import * as THREE from "three";

function addBranch(group, start, end, radius, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const branch = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.68, radius, direction.length(), 9),
    material
  );
  branch.position.copy(start).add(end).multiplyScalar(0.5);
  branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  branch.castShadow = true;
  branch.receiveShadow = true;
  group.add(branch);
}

export function createTree1() {
  const tree = new THREE.Group();
  tree.name = "Old garden tree";
  const windParts = [];

  const bark = new THREE.MeshStandardMaterial({ color: 0x6f492c, roughness: 1 });
  const leafMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x3f7138, roughness: 0.9, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x527f40, roughness: 0.9, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x668d48, roughness: 0.9, flatShading: true }),
  ];

  addBranch(tree, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, 4.35, 0), 0.72, bark);
  addBranch(tree, new THREE.Vector3(0, 2.8, 0), new THREE.Vector3(-1.45, 5.15, 0.25), 0.35, bark);
  addBranch(tree, new THREE.Vector3(0, 3.0, 0), new THREE.Vector3(1.5, 5.25, -0.25), 0.34, bark);
  addBranch(tree, new THREE.Vector3(0.05, 3.7, 0), new THREE.Vector3(0.25, 5.9, 0.75), 0.28, bark);

  const crownGeometry = new THREE.IcosahedronGeometry(1.45, 2);
  const crowns = [
    [-1.65, 5.35, 0.2, 1.08], [0, 5.95, 0.25, 1.2], [1.6, 5.45, -0.25, 1.04],
    [-0.8, 6.55, -0.45, 0.9], [0.9, 6.55, 0.35, 0.88], [-0.25, 5.3, 1.25, 0.92],
  ];

  crowns.forEach(([x, y, z, scale], index) => {
    const crown = new THREE.Mesh(crownGeometry, leafMaterials[index % leafMaterials.length]);
    crown.position.set(x, y, z);
    crown.scale.set(scale, scale * 0.86, scale);
    crown.rotation.set(index * 0.18, index * 0.61, 0);
    crown.castShadow = true;
    crown.receiveShadow = true;
    tree.add(crown);
    crown.userData.restRotationZ = crown.rotation.z;
    windParts.push(crown);
  });

  const rootGeometry = new THREE.CylinderGeometry(0.08, 0.2, 1.35, 6);
  for (let index = 0; index < 5; index += 1) {
    const root = new THREE.Mesh(rootGeometry, bark);
    root.position.set(Math.sin(index * 1.26) * 0.52, 0.12, Math.cos(index * 1.26) * 0.52);
    root.rotation.z = Math.PI / 2.35;
    root.rotation.y = index * 1.26;
    root.castShadow = true;
    tree.add(root);
  }

  tree.userData.windParts = windParts;

  return tree;
}
