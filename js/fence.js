import * as THREE from "three";

export function createFence() {
    const fenceGroup = new THREE.Group();

    const groundWidth = 40;
    const groundDepth = 30;

    const postHeight = 2;
    const postSpacing = 2;

    const postGeometry = new THREE.BoxGeometry(0.18, postHeight,0.18 );

    const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b5a2b,
            roughness: 0.8
        });

 

    function createFenceSide( length, horizontal = true) {
        const side = new THREE.Group();

   
        for ( let position = -length / 2; position <= length / 2;position += postSpacing) {
            const post = new THREE.Mesh(postGeometry,woodMaterial);

            post.position.y =postHeight / 2;

            if (horizontal) {
                post.position.x =position;
            } else {
                post.position.z =
                    position;
            }

            post.castShadow = true;
            post.receiveShadow = true;

            side.add(post);
        }

   

        const railGeometry = horizontal ? new THREE.BoxGeometry( length, 0.15, 0.12 ): new THREE.BoxGeometry(
                      0.12,
                      0.15,
                      length
                  );

        const lowerRail =new THREE.Mesh(railGeometry,woodMaterial);

        lowerRail.position.y = 0.7;

        const upperRail = new THREE.Mesh( railGeometry,woodMaterial);

        upperRail.position.y = 1.4;

        lowerRail.castShadow = true;
        upperRail.castShadow = true;

        side.add(lowerRail);
        side.add(upperRail);

        return side;
    }

   

    const frontFence = createFenceSide(groundWidth, true);

    frontFence.position.z = groundDepth / 2;

    fenceGroup.add(frontFence);

   

    const backFence = createFenceSide( groundWidth, true);

    backFence.position.z = -groundDepth / 2;

    fenceGroup.add( backFence);



    const leftFence =createFenceSide(groundDepth,false);

    leftFence.position.x = -groundWidth / 2;

    fenceGroup.add(leftFence);

   

    const rightFence =createFenceSide( groundDepth, false);

    rightFence.position.x =groundWidth / 2;

    fenceGroup.add(rightFence);

    return fenceGroup;
}