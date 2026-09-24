import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";


// =====================================================
// POSSIBLE HIDING SPOTS
// =====================================================

const hidingSpots = [

    // Behind tree1
    new THREE.Vector3(
        -8.8,
        0,
        -4.2
    ),

    // Behind car
    new THREE.Vector3(
        7.8,
        0,
        -3.4
    ),

    // Behind house
    new THREE.Vector3(
        0,
        0,
        -11
    ),

    // Behind bench
    new THREE.Vector3(
        -5.35,
        0,
        3.15
    ),

    // Behind bushes
    new THREE.Vector3(
        2.5,
        0,
        -5.2
    ),

    // Perimeter grove
    new THREE.Vector3(
        -15.1,
        0,
        -11.75
    ),

    new THREE.Vector3(
        13.1,
        0,
        -11.75
    ),

    new THREE.Vector3(
        -15.1,
        0,
        7.2
    ),

    new THREE.Vector3(
        15.1,
        0,
        11.15
    ),

    new THREE.Vector3(
        -10.1,
        0,
        14.25
    ),

    new THREE.Vector3(
        11.1,
        0,
        15.2
    )

];


// =====================================================
// FRIEND STARTING POSITIONS
// =====================================================

const startingPositions = [

    new THREE.Vector3(
        -2,
        0,
        7
    ),

    new THREE.Vector3(
        0,
        0,
        8
    ),

    new THREE.Vector3(
        2,
        0,
        7
    )

];


// =====================================================
// SHUFFLE HIDING SPOTS
// =====================================================

function shuffledSpots() {

    const spots =
        hidingSpots.map(
            (spot) => spot.clone()
        );


    for (
        let index = spots.length - 1;
        index > 0;
        index -= 1
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                (index + 1)
            );


        [
            spots[index],
            spots[randomIndex]
        ] = [
            spots[randomIndex],
            spots[index]
        ];

    }


    return spots;

}


// =====================================================
// CREATE HIDDEN PLAYERS
// =====================================================

export function createHiddenPlayers() {

    const loader =
        new GLTFLoader();


    const modelUrl =
        new URL(
            "../models/boy.glb",
            import.meta.url
        ).href;


    return new Promise(
        (
            resolve,
            reject
        ) => {

            loader.load(

                modelUrl,


                // =========================================
                // MODEL LOADED
                // =========================================

                (gltf) => {

                    const selectedSpots =
                        shuffledSpots()
                            .slice(
                                0,
                                3
                            );


                    const runClip =
                        THREE.AnimationClip.findByName(
                            gltf.animations,
                            "mixamo.com"
                        );


                    const hiddenPlayers =
                        selectedSpots.map(
                            (
                                spot,
                                index
                            ) => {


                                // =========================
                                // CLONE CHARACTER
                                // =========================

                                const character =
                                    cloneSkeleton(
                                        gltf.scene
                                    );


                                character.name =
                                    `Friend-${index + 1}`;


                                // =========================
                                // START POSITION
                                // =========================

                                character.position.copy(
                                    startingPositions[index]
                                );


                                // =========================
                                // SHADOWS
                                // =========================

                                character.traverse(
                                    (child) => {

                                        if (
                                            child.isMesh
                                        ) {

                                            child.castShadow =
                                                true;

                                            child.receiveShadow =
                                                true;

                                        }

                                    }
                                );


                                // =========================
                                // ANIMATION MIXER
                                // =========================

                                const mixer =
                                    new THREE.AnimationMixer(
                                        character
                                    );


                                const action =
                                    runClip
                                        ? mixer.clipAction(
                                            runClip
                                        )
                                        : null;


                                if (
                                    action
                                ) {

                                    action
                                        .reset()
                                        .play();


                                    action.timeScale =
                                        1.3;


                                    action.paused =
                                        false;

                                }


                                // =========================
                                // FRIEND AI DATA
                                // =========================

                                return {

                                    character,

                                    mixer,

                                    action,

                                    found: false,


                                    // Friend starts by moving
                                    state:
                                        "moving",


                                    // IMPORTANT:
                                    // this is where the
                                    // friend wants to hide

                                    targetPosition:
                                        spot.clone()

                                };

                            }
                        );


                    resolve(
                        hiddenPlayers
                    );

                },


                // =========================================
                // PROGRESS
                // =========================================

                undefined,


                // =========================================
                // ERROR
                // =========================================

                (error) => {

                    console.error(
                        "Error loading hidden friends:",
                        error
                    );


                    reject(
                        error
                    );

                }

            );

        }
    );

}