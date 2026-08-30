import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { createSky } from "./sky.js";
import { createSunlight } from "./sunlight.js";
import { createGround } from "./ground.js";
import { createHouse } from "./house.js";
import { createCar } from "./car.js";
import { createTree1 } from "./tree1.js";
import { createTree2 } from "./tree2.js";
import { createBench } from "./bench.js";
import { createBushes } from "./bushes.js";
import { createHiddenPlayers } from "./hiddenPlayers.js";
import { createBreeze, updateBreeze } from "./wind.js";
import { createRocks } from "./rocks.js";
import { createClouds, updateClouds } from "./clouds.js";
import { createLandscape, updateLandscape } from "./landscape.js";
import { createGameSounds, updateGameSounds, playJumpSound } from "./sounds.js";

import { createPlayer } from "./player.js";

import {
    setupControls,
    keys
} from "./controls.js";


// --------------------------------
// GAME AREA
// --------------------------------

const gameArea =
    document.getElementById(
        "gameArea"
    );


// --------------------------------
// SCENE
// --------------------------------

const scene =
    new THREE.Scene();

scene.background =
    createSky();


// --------------------------------
// CAMERA
// --------------------------------

const camera =
    new THREE.PerspectiveCamera(
        60,

        window.innerWidth /
        window.innerHeight,

        0.1,
        1000
    );


camera.position.set(
    10,
    8,
    18
);


// --------------------------------
// RENDERER
// --------------------------------

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.shadowMap.enabled =
    true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.05;

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

const gameSounds = createGameSounds(camera);


gameArea.appendChild(
    renderer.domElement
);


// --------------------------------
// MOUSE CAMERA CONTROLS
// --------------------------------

const orbitControls =new OrbitControls(camera,renderer.domElement);

orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.08;
orbitControls.enablePan = false;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 30;
orbitControls.maxPolarAngle = Math.PI * 0.48;

orbitControls.target.set( 0,1.5, 6);

orbitControls.update();

const desiredCameraTarget = new THREE.Vector3();

const cameraTargetShift = new THREE.Vector3();


// --------------------------------
// LIGHT
// --------------------------------

const sunlight =createSunlight();

scene.add(sunlight);


// --------------------------------
// GROUND
// --------------------------------

const ground =createGround();

scene.add(ground);


// --------------------------------
// CLOUDS
// --------------------------------

const clouds = createClouds();

scene.add(clouds);


// --------------------------------
// HOUSE
// --------------------------------

const house =createHouse();

house.position.set(0, 0, -8);

scene.add( house);


// --------------------------------
// CAR
// --------------------------------

const car =createCar();

car.position.set(7,0,-2);

scene.add( car);


// --------------------------------
// TREE 1
// --------------------------------

const tree1 =createTree1();

tree1.position.set(-8, 0, -3);

scene.add( tree1);


// --------------------------------
// TREE 2
// --------------------------------

const tree2 =createTree2();

tree2.position.set(9, 0, 4);

scene.add(
    tree2
);


// --------------------------------
// PERIMETER GROVE
// --------------------------------

const perimeterTreeLayout = [
    [-15, 0, -11, 0.82, 1],
    [13, 0, -11, 0.76, 2],
    [-15, 0, 8, 0.72, 2],
    [15, 0, 12, 0.86, 1],
    [-10, 0, 15, 0.68, 2],
    [11, 0, 16, 0.74, 1],
    [-20, 0, -3, 0.5, 2],
    [20, 0, -4, 1.08, 1],
    [-19, 0, 17, 0.96, 1],
    [19, 0, 18, 0.55, 2],
    [-4, 0, 21, 0.58, 2],
    [4, 0, -17, 1.12, 1]
];

const perimeterTrees = perimeterTreeLayout.map(
    ([x, y, z, scale, type], index) => {

        const tree = type === 1
            ? createTree1()
            : createTree2();

        tree.position.set(x, y, z);
        tree.scale.setScalar(scale);
        tree.rotation.y = index * 0.83;
        tree.userData.windPhase = index * 1.19 + 0.4;

        scene.add(tree);
        return tree;
    }
);


// --------------------------------
// BENCH
// --------------------------------

const bench = createBench();

bench.position.set( -5, 0, 4);

scene.add(bench);


// --------------------------------
// BUSHES
// --------------------------------

const bushes =
    createBushes();

bushes.position.set(
    2,
    0,
    -4
);

scene.add(
    bushes
);


// --------------------------------
// GARDEN BOULDERS
// --------------------------------

const rocks = createRocks();

scene.add(rocks);

const landscape = createLandscape();

scene.add(landscape);


// --------------------------------
// HIDDEN FRIENDS
// --------------------------------

let hiddenPlayers = [];

createHiddenPlayers()
    .then((friends) => {

        hiddenPlayers = friends;

        hiddenPlayers.forEach(({ character }) => {
            scene.add(character);
        });

    })
    .catch((error) => {
        console.error("Hidden friends failed to load", error);
    });


// --------------------------------
// GENTLE MORNING BREEZE
// --------------------------------

const breeze = createBreeze();
const windVegetation = [tree1, tree2, ...perimeterTrees, bushes];

tree1.userData.windPhase = 0.2;
tree2.userData.windPhase = 2.1;
bushes.userData.windPhase = 4.4;

scene.add(breeze);


// --------------------------------
// CONTROLS
// --------------------------------

setupControls();


// --------------------------------
// PLAYER VARIABLES
// --------------------------------

let player = null;

let mixer = null;

let animations = {};

let currentAnimation = null;


// --------------------------------
// LOAD PLAYER
// --------------------------------

createPlayer()
    .then((data) => {

        player =
            data.player;

        mixer =
            data.mixer;

        animations =
            data.animations;


        scene.add(
            player
        );


        currentAnimation =animations.idle;

        // This model has no idle clip. Keep its running action scheduled
        // on a natural keyframe so stopping does not reveal the T-pose.
        if (animations.run) {

            animations.run.reset().play();

            animations.run.time = 0;
            animations.run.paused = true;

        }

    })
    .catch((error) => {

        console.error("Player failed to load",error);

    });


// --------------------------------
// CLOCK
// --------------------------------

const clock =new THREE.Clock();


// --------------------------------
// CHANGE ANIMATION
// --------------------------------

function playAnimation(action) {

    if (!action) {
        return;
    }


    if (
        currentAnimation === action
    ) {
        return;
    }


    if (currentAnimation) {

        currentAnimation.fadeOut( 0.2);

    }


    action
        .reset()
        .fadeIn(0.2)
        .play();


    currentAnimation = action;
}


// --------------------------------
// UPDATE PLAYER
// --------------------------------

const moveDirection =new THREE.Vector3();
const WALK_SPEED = 11;
const SPRINT_SPEED = 16;
const CROUCH_SPEED = 4.5;
const JUMP_FORCE = 8.5;
const GRAVITY = 22;
let verticalVelocity = 0;
let isGrounded = true;
let jumpWasHeld = false;

function updatePlayer(delta) {

    if (!player) {
        return;
    }

    // Reset direction every frame
    moveDirection.set(0, 0, 0);

    // -------------------------
    // KEYBOARD DIRECTION
    // -------------------------

    if (keys.forward) {
        moveDirection.z -= 1;
    }

    if (keys.backward) {
        moveDirection.z += 1;
    }

    if (keys.left) {
        moveDirection.x -= 1;
    }

    if (keys.right) {
        moveDirection.x += 1;
    }

    // Is player moving?
    const moving =
        moveDirection.lengthSq() > 0;


    if (moving) {

        // Important for diagonal movement
        moveDirection.normalize();

        // -------------------------
        // SPEED
        // -------------------------

        const speed = keys.crouch
            ? CROUCH_SPEED
            : keys.run
                ? SPRINT_SPEED
                : WALK_SPEED;

        // -------------------------
        // FIND ANGLE
        // -------------------------

        const targetAngle = Math.atan2( moveDirection.x,moveDirection.z );

        // -------------------------
        // SMOOTH ROTATION
        // -------------------------

        let angleDifference =targetAngle -player.rotation.y;

        angleDifference =
            Math.atan2(
                Math.sin(angleDifference),
                Math.cos(angleDifference)
            );

        player.rotation.y +=
            angleDifference *
            Math.min(
                1,
                10 * delta
            );

        // -------------------------
        // MOVE PLAYER
        // -------------------------

        player.position.x +=
            moveDirection.x *
            speed *
            delta;

        player.position.z +=
            moveDirection.z *
            speed *
            delta;

        // -------------------------
        // RUN ANIMATION
        // -------------------------

        if (
            animations.run
        ) {

            // Match the stride to normal running, sprinting, or crouch-walking.
            animations.run.timeScale = keys.crouch ? 0.72 : keys.run ? 2 : 1.55;
            animations.run.paused = false;

            if (!animations.run.isRunning()) {

                animations.run
                    .reset()
                    .play();

            }

        }

    }

    else {

        if (
            animations.run
        ) {

            animations.run.time = 0;
            animations.run.paused = true;
        }

    }


    // -------------------------
    // JUMP + CROUCH
    // -------------------------

    if (keys.jump && !jumpWasHeld && isGrounded && !keys.crouch) {
        verticalVelocity = JUMP_FORCE;
        isGrounded = false;
        playJumpSound(gameSounds);
    }

    jumpWasHeld = keys.jump;

    if (!isGrounded) {
        verticalVelocity -= GRAVITY * delta;
        player.position.y += verticalVelocity * delta;

        if (player.position.y <= 0) {
            player.position.y = 0;
            verticalVelocity = 0;
            isGrounded = true;
        }
    }

    const crouchBlend = 1 - Math.exp(-12 * delta);
    const targetHeightScale = keys.crouch && isGrounded ? 0.62 : 1;
    const targetForwardLean = keys.crouch && isGrounded ? 0.12 : 0;

    player.scale.y = THREE.MathUtils.lerp(
        player.scale.y,
        targetHeightScale,
        crouchBlend
    );
    player.rotation.x = THREE.MathUtils.lerp(
        player.rotation.x,
        targetForwardLean,
        crouchBlend
    );

    updateGameSounds(gameSounds, {
        moving,
        grounded: isGrounded,
        crouching: keys.crouch,
        sprinting: keys.run
    });

}


// --------------------------------
// CAMERA FOLLOW
// --------------------------------

function updateCamera(delta) {

    if (player) {

        desiredCameraTarget.set(
            player.position.x,
            player.position.y + 1.5,
            player.position.z
        );

        const cameraSmoothness =
            1 -
            Math.exp(
                -5 * delta
            );

        cameraTargetShift
            .subVectors(
                desiredCameraTarget,
                orbitControls.target
            )
            .multiplyScalar(
                cameraSmoothness
            );

        // Move the camera and its target together so the selected
        // orbit angle is preserved while following the player.
        orbitControls.target.add(
            cameraTargetShift
        );

        camera.position.add(
            cameraTargetShift
        );

    }

    orbitControls.update();

}


// --------------------------------
// ANIMATION LOOP
// --------------------------------

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        clock.getDelta();

    const elapsed =
        clock.elapsedTime;


    // Update character animation

    if (mixer) {

        mixer.update(
            delta
        );

    }


    updatePlayer(
        delta
    );


    updateCamera(
        delta
    );


    updateBreeze(
        windVegetation,
        breeze,
        elapsed,
        delta,
        ground
    );


    updateClouds(
        clouds,
        delta,
        player?.position
    );


    updateLandscape(
        landscape,
        elapsed
    );


    renderer.render(
        scene,
        camera
    );

}


animate();


// --------------------------------
// WINDOW RESIZE
// --------------------------------

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);
