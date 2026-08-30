import * as THREE from "three";

export function createBreeze() {
  const count = 44;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = -18 + ((index * 7.73) % 36);
    positions[index * 3 + 1] = 0.8 + ((index * 2.17) % 5.2);
    positions[index * 3 + 2] = -16 + ((index * 5.41) % 34);
    speeds[index] = 1.55 + (index % 7) * 0.16;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xf1dba4,
      size: 0.035,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  particles.name = "Morning pollen";
  particles.userData.speeds = speeds;
  return particles;
}

export function updateBreeze(objects, particles, elapsed, delta, ground) {
  objects.forEach((object, objectIndex) => {
    const phase = object.userData.windPhase ?? objectIndex * 1.37;
    object.rotation.z = Math.sin(elapsed * 2.8 + phase) * 0.034;
    object.rotation.x = Math.cos(elapsed * 2.25 + phase) * 0.018;

    (object.userData.windParts || []).forEach((part, partIndex) => {
      part.rotation.z = part.userData.restRotationZ
        + Math.sin(elapsed * 5.4 + phase + partIndex * 0.72) * 0.072;
    });
  });

  const position = particles.geometry.attributes.position;
  const speeds = particles.userData.speeds;
  for (let index = 0; index < position.count; index += 1) {
    let x = position.getX(index) + speeds[index] * delta;
    const y = position.getY(index)
      + Math.sin(elapsed * 1.8 + index) * 0.032 * delta;
    let z = position.getZ(index) + speeds[index] * 0.28 * delta;

    if (x > 18) x = -18;
    if (z > 18) z = -16;
    position.setXYZ(index, x, y, z);
  }
  position.needsUpdate = true;

  if (ground?.userData.grassWindTime) {
    ground.userData.grassWindTime.value = elapsed;
  }
}
