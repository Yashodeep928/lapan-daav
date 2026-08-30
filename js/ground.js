import * as THREE from "three";

function seededVariation(index) {
  const value = Math.sin(index * 91.17 + 7.31) * 43758.5453;
  return value - Math.floor(value);
}

function createBladeGeometry() {
  const positions = [];
  const uvs = [];
  const indices = [];

  function addBlade(angle, offsetX, offsetZ, height, width) {
    const start = positions.length / 3;
    const levels = [
      [-width * 0.72, 0], [width * 0.72, 0],
      [width, height * 0.42], [-width, height * 0.42],
      [width * 0.62, height * 0.78], [-width * 0.62, height * 0.78],
      [0, height],
    ];
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    levels.forEach(([across, y]) => {
      positions.push(
        offsetX + across * cosine,
        y,
        offsetZ + across * sine
      );
    });
    uvs.push(0, 0, 1, 0, 1, 0.42, 0, 0.42, 0.82, 0.78, 0.18, 0.78, 0.5, 1);
    indices.push(
      start, start + 1, start + 2,
      start, start + 2, start + 3,
      start + 3, start + 2, start + 4,
      start + 3, start + 4, start + 5,
      start + 5, start + 4, start + 6
    );
  }

  addBlade(0, -0.025, 0, 0.34, 0.038);
  addBlade(Math.PI * 0.67, 0.025, 0.018, 0.29, 0.034);
  addBlade(Math.PI * 1.31, 0.012, -0.025, 0.38, 0.035);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createGrassField() {
  const fieldWidth = 118;
  const fieldDepth = 118;
  const columns = 180;
  const rows = 180;
  const bladeCount = columns * rows;
  const windTime = { value: 0 };
  const material = new THREE.MeshBasicMaterial({
    color: 0x3f702c,
    side: THREE.DoubleSide,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGrassWindTime = windTime;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uGrassWindTime;"
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        float bladeTip = smoothstep(0.0, 0.38, position.y);
        float windPhase = instanceMatrix[3].x * 0.16 + instanceMatrix[3].z * 0.12;
        float gust = sin(uGrassWindTime * 7.4 + windPhase)
          + sin(uGrassWindTime * 10.6 + windPhase * 1.7) * 0.42;
        transformed.x += gust * 0.115 * bladeTip;
        transformed.z += cos(uGrassWindTime * 6.1 + windPhase) * 0.052 * bladeTip;`
      );
  };
  material.customProgramCacheKey = () => "windy-instanced-grass-v2";

  const field = new THREE.InstancedMesh(createBladeGeometry(), material, bladeCount);
  field.name = "Wind-swept grass";
  field.receiveShadow = true;
  field.frustumCulled = false;

  const transform = new THREE.Object3D();
  let placed = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const sample = row * columns + column;
      const x = -fieldWidth / 2
        + (column + 0.2 + seededVariation(sample * 3 + 17) * 0.6)
        * (fieldWidth / columns);
      const z = -fieldDepth / 2
        + (row + 0.2 + seededVariation(sample * 3 + 53) * 0.6)
        * (fieldDepth / rows);

      // Keep the front path readable and free of clipping grass.
      if (Math.abs(x) < 1.7 && z > -4.8 && z < 8.2) continue;

      const height = 0.72 + seededVariation(sample + 101) * 0.48;
      const width = 0.85 + seededVariation(sample + 173) * 0.25;
      transform.position.set(x, 0.018, z);
      transform.rotation.set(0, seededVariation(sample + 229) * Math.PI, 0);
      transform.scale.set(width, height, width);
      transform.updateMatrix();
      field.setMatrixAt(placed, transform.matrix);
      placed += 1;
    }
  }

  field.count = placed;
  field.instanceMatrix.needsUpdate = true;
  return { field, windTime };
}

export function createGround() {
  const garden = new THREE.Group();
  garden.name = "Garden ground";

  const grassGeometry = new THREE.PlaneGeometry(120, 120, 24, 24);
  const baseGrass = new THREE.Color(0x668d45);
  const colors = [];

  for (let index = 0; index < grassGeometry.attributes.position.count; index += 1) {
    const color = baseGrass.clone();
    color.offsetHSL(
      (seededVariation(index) - 0.5) * 0.025,
      (seededVariation(index + 41) - 0.5) * 0.08,
      (seededVariation(index + 83) - 0.5) * 0.09
    );
    colors.push(color.r, color.g, color.b);
  }

  grassGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const grass = new THREE.Mesh(
    grassGeometry,
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.96,
    })
  );
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  garden.add(grass);

  const bladeGrass = createGrassField();
  garden.add(bladeGrass.field);
  garden.userData.grassWindTime = bladeGrass.windTime;

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(2.65, 12),
    new THREE.MeshStandardMaterial({ color: 0xb79b71, roughness: 1 })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.012, 1.5);
  path.receiveShadow = true;
  garden.add(path);

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1c3a8,
    roughness: 0.92,
  });

  for (let index = 0; index < 7; index += 1) {
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48 + (index % 3) * 0.06, 0.5, 0.07, 10),
      stoneMaterial
    );
    stone.position.set(index % 2 === 0 ? -0.2 : 0.22, 0.05, -3.25 + index * 1.5);
    stone.rotation.y = index * 0.57;
    stone.scale.z = 0.72 + (index % 2) * 0.12;
    stone.receiveShadow = true;
    garden.add(stone);
  }

  const patchMaterial = new THREE.MeshStandardMaterial({
    color: 0x6c9148,
    roughness: 1,
    depthWrite: false,
  });
  const patches = [
    [-9, -8, 2.8, 1.4], [10, -7, 2.2, 1.2], [-12, 6, 2.4, 1.1],
    [7, 8, 2.7, 1.35], [-3.8, 9, 1.8, 0.9],
  ];

  patches.forEach(([x, z, scaleX, scaleZ], index) => {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(1, 18), patchMaterial);
    patch.rotation.x = -Math.PI / 2;
    patch.rotation.z = index * 0.81;
    patch.position.set(x, 0.008, z);
    patch.scale.set(scaleX, scaleZ, 1);
    garden.add(patch);
  });

  return garden;
}
