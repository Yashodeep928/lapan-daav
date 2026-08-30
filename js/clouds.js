import * as THREE from "three";

export function createClouds() {
  const skyClouds = new THREE.Group();
  skyClouds.name = "Morning clouds";

  const lightCloudMaterial = new THREE.MeshLambertMaterial({
    color: 0xeaf4f6,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  });
  const thickCloudMaterial = new THREE.MeshLambertMaterial({
    color: 0xfff9ec,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
  });
  const puffGeometry = new THREE.SphereGeometry(1, 14, 10);
  const layout = [];

  // Multiple staggered radii form a complete cloud canopy in every direction.
  for (let index = 0; index < 28; index += 1) {
    const angle = (index / 28) * Math.PI * 2 + (index % 2) * 0.055;
    const radius = 36 + (index % 4) * 7;
    const y = 10 + (index % 5) * 1.55;
    const scale = 0.76 + (index % 6) * 0.13;
    const angularSpeed = 0.004 + (index % 5) * 0.0012;
    const thickness = index % 3 === 0 || index % 7 === 0 ? 1 : 0;
    layout.push([angle, radius, y, scale, angularSpeed, thickness]);
  }

  // A smaller high ring prevents an empty patch directly overhead.
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2 + 0.22;
    const radius = 19 + (index % 2) * 5;
    const y = 18 + (index % 3) * 1.25;
    const scale = 0.72 + (index % 4) * 0.12;
    const angularSpeed = 0.006 + (index % 3) * 0.001;
    layout.push([angle, radius, y, scale, angularSpeed, index % 2]);
  }

  layout.forEach(([angle, radius, y, scale, angularSpeed, thickness], cloudIndex) => {
    const cloud = new THREE.Group();
    const puffs = [
      [-2.2, 0, 0, 1.35, 0.72, 0.82],
      [-0.8, 0.45, 0, 1.55, 1.0, 1.0],
      [0.75, 0.55, 0, 1.8, 1.18, 1.08],
      [2.25, 0.05, 0, 1.45, 0.78, 0.9],
      [0, -0.18, 0.25, 2.55, 0.62, 1.05],
    ];

    puffs.forEach(([px, py, pz, sx, sy, sz]) => {
      const puff = new THREE.Mesh(
        puffGeometry,
        thickness ? thickCloudMaterial : lightCloudMaterial
      );
      puff.position.set(px, py, pz);
      puff.scale.set(
        sx * (thickness ? 1.08 : 1),
        sy * (thickness ? 1.12 : 0.58),
        sz
      );
      cloud.add(puff);
    });

    cloud.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    cloud.rotation.y = angle + Math.PI / 2;
    cloud.scale.setScalar(scale);
    cloud.userData.angle = angle;
    cloud.userData.radius = radius;
    cloud.userData.angularSpeed = angularSpeed;
    cloud.userData.baseY = y;
    cloud.userData.bobPhase = cloudIndex * 0.73;
    skyClouds.add(cloud);
  });

  return skyClouds;
}

export function updateClouds(clouds, delta, focusPosition) {
  clouds.userData.elapsed = (clouds.userData.elapsed || 0) + delta;

  if (focusPosition) {
    clouds.position.x = focusPosition.x;
    clouds.position.z = focusPosition.z;
  }

  clouds.children.forEach((cloud) => {
    cloud.userData.angle += cloud.userData.angularSpeed * 2.2 * delta;
    cloud.position.x = Math.cos(cloud.userData.angle) * cloud.userData.radius;
    cloud.position.z = Math.sin(cloud.userData.angle) * cloud.userData.radius;
    cloud.position.y = cloud.userData.baseY
      + Math.sin(clouds.userData.elapsed * 0.48 + cloud.userData.bobPhase) * 0.24;
    cloud.rotation.y = cloud.userData.angle + Math.PI / 2;
  });
}
