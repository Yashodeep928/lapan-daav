import * as THREE from "three";

export function createSunlight() {
  const lighting = new THREE.Group();
  lighting.name = "Morning lighting";

  const hemisphere = new THREE.HemisphereLight(0xc9e8ff, 0x6f674d, 1.25);

  const sun = new THREE.DirectionalLight(0xffddb0, 2.15);
  sun.name = "Morning sun";
  sun.position.set(-12, 18, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 48;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.035;
  sun.target.position.set(0, 0, -3);

  lighting.add(hemisphere, sun, sun.target);
  return lighting;
}
