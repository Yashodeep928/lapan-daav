import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";

const hidingSpots = [
    // Behind tree1 (-8, 0, -3)
    new THREE.Vector3(-8.8, 0, -4.2),

    // Behind the car (7, 0, -2)
    new THREE.Vector3(7.8, 0, -3.4),

    // Behind the house (0, 0, -8)
    new THREE.Vector3(0, 0, -11),

    // Behind the bench (-5, 0, 4)
    new THREE.Vector3(-5.35, 0, 3.15),

    // Behind the bushes (2, 0, -4)
    new THREE.Vector3(2.5, 0, -5.2),

    // Around the perimeter grove
    new THREE.Vector3(-15.1, 0, -11.75),
    new THREE.Vector3(13.1, 0, -11.75),
    new THREE.Vector3(-15.1, 0, 7.2),
    new THREE.Vector3(15.1, 0, 11.15),
    new THREE.Vector3(-10.1, 0, 14.25),
    new THREE.Vector3(11.1, 0, 15.2)
];

function shuffledSpots() {
    const spots = hidingSpots.map((spot) => spot.clone());

    // Fisher-Yates shuffle. Each entry occurs only once, so selecting the
    // first three always gives the friends different hiding spots.
    for (let index = spots.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [spots[index], spots[randomIndex]] = [
            spots[randomIndex],
            spots[index]
        ];
    }

    return spots;
}

export function createHiddenPlayers() {
    const loader = new GLTFLoader();
    const modelUrl = new URL("../models/boy.glb", import.meta.url).href;

    return new Promise((resolve, reject) => {
        loader.load(
            modelUrl,
            (gltf) => {
                const selectedSpots = shuffledSpots().slice(0, 3);
                const runClip = THREE.AnimationClip.findByName(
                    gltf.animations,
                    "mixamo.com"
                );

                const hiddenPlayers = selectedSpots.map((spot, index) => {
                    const character = cloneSkeleton(gltf.scene);
                    character.name = `Friend-${index + 1}`;
                    character.position.copy(spot);

                    character.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    const mixer = new THREE.AnimationMixer(character);
                    const action = runClip
                        ? mixer.clipAction(runClip)
                        : null;

                    if (action) {
                        action.reset().play();
                        mixer.setTime(
                            runClip.duration * (0.12 + index * 0.17)
                        );
                        action.paused = true;
                    }

                    // Hold a natural animation frame while the friend hides.
                    return {
                        character,
                        mixer,
                        action,
                        found: false
                    };
                });

                resolve(hiddenPlayers);
            },
            undefined,
            (error) => {
                console.error("Error loading hidden friends:", error);
                reject(error);
            }
        );
    });
}
