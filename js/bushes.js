import * as THREE from "three";

export function createBushes() {
  const bushes = new THREE.Group();
  bushes.name = "Flowering hedge";
  const windParts = [];

  const leafMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x38683a, roughness: 0.96, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x4d7b43, roughness: 0.96, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x5b8648, roughness: 0.96, flatShading: true }),
  ];
  const soil = new THREE.MeshStandardMaterial({ color: 0x654b35, roughness: 1 });
  const leafGeometry = new THREE.IcosahedronGeometry(0.82, 2);

  const bed = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 1.75), soil);
  bed.position.set(3, 0.06, 0);
  bed.receiveShadow = true;
  bushes.add(bed);

  for (let index = 0; index < 7; index += 1) {
    const x = index;
    const main = new THREE.Mesh(leafGeometry, leafMaterials[index % leafMaterials.length]);
    main.position.set(x, 0.78 + (index % 2) * 0.1, 0);
    main.scale.set(1.0, 0.9 + (index % 3) * 0.06, 0.88);
    main.rotation.y = index * 0.72;
    main.castShadow = true;
    main.receiveShadow = true;
    bushes.add(main);
    main.userData.restRotationZ = main.rotation.z;
    windParts.push(main);

    if (index < 6) {
      const filler = new THREE.Mesh(leafGeometry, leafMaterials[(index + 1) % leafMaterials.length]);
      filler.position.set(x + 0.5, 0.62, index % 2 === 0 ? 0.25 : -0.22);
      filler.scale.set(0.76, 0.7, 0.68);
      filler.rotation.y = index * 0.91;
      filler.castShadow = true;
      bushes.add(filler);
      filler.userData.restRotationZ = filler.rotation.z;
      windParts.push(filler);
    }
  }

  const flowerColors = [0xe7b7bd, 0xf0d88c, 0xb8cbea];
  const flowerGeometry = new THREE.SphereGeometry(0.08, 8, 6);
  for (let index = 0; index < 12; index += 1) {
    const flower = new THREE.Mesh(
      flowerGeometry,
      new THREE.MeshStandardMaterial({ color: flowerColors[index % flowerColors.length], roughness: 0.75 })
    );
    flower.position.set(0.25 + (index * 0.59) % 6.5, 1.12 + (index % 3) * 0.12, index % 2 ? 0.58 : -0.52);
    flower.castShadow = true;
    bushes.add(flower);
  }

  bushes.userData.windParts = windParts;

  return bushes;
}
