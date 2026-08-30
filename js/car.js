import * as THREE from "three";

function makeCarSilhouette() {
  const shape = new THREE.Shape();
  shape.moveTo(-2.15, 0.42);
  shape.lineTo(-2.05, 0.98);
  shape.lineTo(-1.2, 1.12);
  shape.lineTo(-0.63, 1.82);
  shape.lineTo(0.72, 1.82);
  shape.lineTo(1.28, 1.12);
  shape.lineTo(2.02, 0.98);
  shape.lineTo(2.17, 0.5);
  shape.lineTo(1.9, 0.34);
  shape.lineTo(-1.9, 0.34);
  shape.closePath();
  return shape;
}

function makeWindowShape(rear = false) {
  const shape = new THREE.Shape();
  if (rear) {
    shape.moveTo(-0.54, 1.2);
    shape.lineTo(-0.48, 1.67);
    shape.lineTo(0.02, 1.67);
    shape.lineTo(0.02, 1.2);
  } else {
    shape.moveTo(0.13, 1.2);
    shape.lineTo(0.13, 1.67);
    shape.lineTo(0.63, 1.67);
    shape.lineTo(1.03, 1.2);
  }
  shape.closePath();
  return shape;
}

export function createCar() {
  const car = new THREE.Group();
  car.name = "Parked compact car";

  const paint = new THREE.MeshPhysicalMaterial({
    color: 0x315f78,
    metalness: 0.28,
    roughness: 0.32,
    clearcoat: 0.75,
    clearcoatRoughness: 0.2,
  });
  const bodyGeometry = new THREE.ExtrudeGeometry(makeCarSilhouette(), {
    depth: 1.78,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.08,
    bevelThickness: 0.08,
    curveSegments: 2,
  });
  bodyGeometry.translate(0, 0, -0.89);
  const body = new THREE.Mesh(bodyGeometry, paint);
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x9ab6bd,
    roughness: 0.12,
    metalness: 0.08,
    clearcoat: 0.9,
    side: THREE.DoubleSide,
  });
  [-0.985, 0.985].forEach((z) => {
    [true, false].forEach((rear) => {
      const windowMesh = new THREE.Mesh(new THREE.ShapeGeometry(makeWindowShape(rear)), glass);
      windowMesh.position.z = z;
      car.add(windowMesh);
    });
  });

  const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x202322, roughness: 0.92 });
  const hubMaterial = new THREE.MeshStandardMaterial({ color: 0xaeb4b2, metalness: 0.78, roughness: 0.34 });
  [-1.35, 1.35].forEach((x) => {
    [-0.99, 0.99].forEach((z) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.3, 24), tireMaterial);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(x, 0.47, z);
      tire.castShadow = true;
      car.add(tire);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.315, 16), hubMaterial);
      hub.rotation.x = Math.PI / 2;
      hub.position.copy(tire.position);
      car.add(hub);
    });
  });

  const bumperMaterial = new THREE.MeshStandardMaterial({ color: 0x363b3d, metalness: 0.5, roughness: 0.5 });
  [-2.16, 2.16].forEach((x) => {
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 1.62), bumperMaterial);
    bumper.position.set(x, 0.46, 0);
    bumper.castShadow = true;
    car.add(bumper);
  });

  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe3a5,
    emissive: 0x5b421d,
    emissiveIntensity: 0.35,
    roughness: 0.25,
  });
  [-0.58, 0.58].forEach((z) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.42), headlightMaterial);
    light.position.set(-2.15, 0.83, z);
    car.add(light);
  });

  const mirrorMaterial = paint.clone();
  [-1.13, 1.13].forEach((z) => {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.22), mirrorMaterial);
    mirror.position.set(0.72, 1.37, z);
    mirror.castShadow = true;
    car.add(mirror);
  });

  return car;
}
