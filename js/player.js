import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function createPlayer() {

    return new Promise((resolve, reject) => {

        const loader = new GLTFLoader();

        // Resolve the model relative to this module instead of the page URL.
        // This keeps the path correct when the app is served from a subfolder.
        const playerModelUrl = new URL(
            "../models/boy.glb",
            import.meta.url
        ).href;

        loader.load(

            playerModelUrl,

            (gltf) => {

                const player = gltf.scene;

                // -------------------------
                // MODEL SIZE
                // -------------------------

                player.scale.set(
                    1,
                    1,
                    1
                );


                // -------------------------
                // START POSITION
                // -------------------------

                player.position.set(
                    0,
                    0,
                    6
                );


                // -------------------------
                // SHADOW
                // -------------------------

                player.traverse((child) => {

                    if (child.isMesh) {

                        child.castShadow = true;
                        child.receiveShadow = true;

                    }

                });


                // -------------------------
                // ANIMATION MIXER
                // -------------------------

                const mixer =
                    new THREE.AnimationMixer(
                        player
                    );


                console.log(
                    "Animations:",
                    gltf.animations
                );


                // Your uploaded model has
                // one animation:
                //
                // "mixamo.com"

                const runClip =
                    THREE.AnimationClip.findByName(
                        gltf.animations,
                        "mixamo.com"
                    );


                let runAction = null;


                if (runClip) {

                    runAction =
                        mixer.clipAction(
                            runClip
                        );

                }


                resolve({

                    player,

                    mixer,

                    animations: {
                        run: runAction
                    }

                });

            },


            undefined,


            (error) => {

                console.error(
                    "Error loading player:",
                    error
                );

                reject(error);

            }

        );

    });

}
