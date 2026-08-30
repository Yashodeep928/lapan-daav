import * as THREE from "three";

export function createRocks() {
  const rocks = new THREE.Group();
  rocks.name = "Garden boulders";

  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x77766d, roughness: 0.98, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x8b8172, roughness: 0.98, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x696d67, roughness: 0.98, flatShading: true }),
  ];
  const geometry = new THREE.DodecahedronGeometry(1, 1);
  const layout = [
    [-11.5, -8.5, 1.35, 0.72, 0.95],
    [13.2, 7.5, 1.1, 0.65, 1.2],
    [-14.2, 13.2, 1.5, 0.78, 0.92],
    [16.5, -7.5, 1.25, 0.7, 1.15],
    [-6.5, 18.2, 1.05, 0.62, 1.25],
  ];

  layout.forEach(([x, z, scaleX, scaleY, scaleZ], index) => {
    const boulder = new THREE.Mesh(geometry, materials[index % materials.length]);
    boulder.position.set(x, scaleY * 0.78, z);
    boulder.scale.set(scaleX, scaleY, scaleZ);
    boulder.rotation.set(index * 0.17, index * 0.93, index * 0.11);
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    rocks.add(boulder);

    const companion = new THREE.Mesh(geometry, materials[(index + 1) % materials.length]);
    companion.position.set(x + scaleX * 0.9, 0.34, z + scaleZ * 0.55);
    companion.scale.setScalar(0.42 + (index % 2) * 0.09);
    companion.scale.y *= 0.72;
    companion.rotation.y = index * 1.21;
    companion.castShadow = true;
    companion.receiveShadow = true;
    rocks.add(companion);
  });

  return rocks;
}
