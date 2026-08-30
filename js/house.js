import * as THREE from "three";

function shadowed(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createGabledRoof(material) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([
    -3.35, 0, 2.85, 3.35, 0, 2.85, 0, 2.05, 2.85,
    -3.35, 0, -2.85, 3.35, 0, -2.85, 0, 2.05, -2.85,
  ], 3));
  geometry.setIndex([
    0, 1, 2, 5, 4, 3,
    0, 2, 5, 0, 5, 3,
    1, 4, 5, 1, 5, 2,
    0, 3, 4, 0, 4, 1,
  ]);
  geometry.computeVertexNormals();
  return shadowed(new THREE.Mesh(geometry, material));
}

export function createHouse() {
  const house = new THREE.Group();
  house.name = "Garden house";

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe7d7b9, roughness: 0.86 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xf5efe3, roughness: 0.78 });
  const foundationMaterial = new THREE.MeshStandardMaterial({ color: 0x8c8b80, roughness: 0.95 });
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f3f32,
    roughness: 0.92,
    flatShading: true,
  });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4028, roughness: 0.84 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8bb6bd,
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  });

  const foundation = shadowed(new THREE.Mesh(
    new THREE.BoxGeometry(6.35, 0.42, 5.25),
    foundationMaterial
  ));
  foundation.position.y = 0.21;
  house.add(foundation);

  const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(6, 3.9, 5), wallMaterial));
  body.position.y = 2.35;
  house.add(body);

  const roof = createGabledRoof(roofMaterial);
  roof.position.y = 4.3;
  house.add(roof);

  [-2.78, 2.78].forEach((z) => {
    const fascia = shadowed(new THREE.Mesh(new THREE.BoxGeometry(6.85, 0.18, 0.16), trimMaterial));
    fascia.position.set(0, 4.3, z);
    house.add(fascia);
  });

  const doorFrame = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.75, 0.18), trimMaterial));
  doorFrame.position.set(0, 1.72, 2.58);
  house.add(doorFrame);

  const door = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.18, 2.48, 0.14), woodMaterial));
  door.position.set(0, 1.6, 2.69);
  house.add(door);

  const upperDoorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.04), glassMaterial);
  upperDoorGlass.position.set(0, 2.05, 2.78);
  house.add(upperDoorGlass);

  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xc8a85f, metalness: 0.75, roughness: 0.28 })
  );
  handle.position.set(0.42, 1.48, 2.81);
  house.add(handle);

  function addWindow(x, y, z, side = false) {
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(side ? 0.08 : 1.32, 1.35, side ? 1.32 : 0.08),
      glassMaterial
    );
    glass.position.set(x, y, z);
    house.add(glass);

    const frameDimensions = side
      ? [
          [0.14, 0.12, 1.62, 0, 0.75, 0], [0.14, 0.12, 1.62, 0, -0.75, 0],
          [0.14, 1.62, 0.12, 0, 0, 0.75], [0.14, 1.62, 0.12, 0, 0, -0.75],
          [0.15, 0.09, 1.45, 0, 0, 0], [0.15, 1.45, 0.09, 0, 0, 0],
        ]
      : [
          [1.62, 0.12, 0.14, 0, 0.75, 0], [1.62, 0.12, 0.14, 0, -0.75, 0],
          [0.12, 1.62, 0.14, 0.75, 0, 0], [0.12, 1.62, 0.14, -0.75, 0, 0],
          [1.45, 0.09, 0.15, 0, 0, 0], [0.09, 1.45, 0.15, 0, 0, 0],
        ];

    frameDimensions.forEach(([width, height, depth, offsetX, offsetY, offsetZ]) => {
      const frame = shadowed(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), trimMaterial));
      frame.position.set(x + offsetX, y + offsetY, z + offsetZ);
      house.add(frame);
    });
  }

  addWindow(-1.95, 2.35, 2.56);
  addWindow(1.95, 2.35, 2.56);
  addWindow(-3.03, 2.35, 0.65, true);
  addWindow(3.03, 2.35, -0.65, true);

  const porch = shadowed(new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.18, 1.55), roofMaterial));
  porch.position.set(0, 3.32, 3.12);
  porch.rotation.x = -0.08;
  house.add(porch);

  [-1.25, 1.25].forEach((x) => {
    const post = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.75, 0.16), trimMaterial));
    post.position.set(x, 1.78, 3.65);
    house.add(post);
  });

  const landing = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 1.15), foundationMaterial));
  landing.position.set(0, 0.36, 3.0);
  house.add(landing);

  [[2.45, 0.18, 0.58, 0.12, 3.72], [2.05, 0.17, 0.52, 0.04, 4.15]].forEach(
    ([width, height, depth, y, z]) => {
      const step = shadowed(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), foundationMaterial));
      step.position.set(0, y, z);
      house.add(step);
    }
  );

  const brickMaterial = new THREE.MeshStandardMaterial({ color: 0x9d6553, roughness: 0.95 });
  const chimney = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.05, 0.72), brickMaterial));
  chimney.position.set(1.65, 5.45, -0.72);
  house.add(chimney);

  const chimneyCap = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.16, 0.88), foundationMaterial));
  chimneyCap.position.set(1.65, 6.48, -0.72);
  house.add(chimneyCap);

  return house;
}
