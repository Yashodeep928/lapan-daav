import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
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

import {setupControls,keys} from "./controls.js";

const gameArea = document.getElementById( "gameArea"  );
const timerDisplay = document.getElementById("timerDisplay");
const friendsDisplay = document.getElementById("friendsDisplay");
const roundMessage = document.getElementById("roundMessage");

const ROUND_DURATION_MS = 60 * 60 * 1000;
const FIND_DISTANCE = 2.25;
let roundStarted = false;
let roundFinished = false;
let roundDeadline = 0;
let foundFriends = 0;
let lastDisplayedSecond = -1;
let messageHideAt = 0;

function formatRoundTime(totalSeconds) {
    const seconds = Math.max(0, Math.ceil(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;

    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function updateFriendsDisplay() {
    friendsDisplay.textContent = `Friends found: ${foundFriends} / ${hiddenPlayers.length || 3}`;
}

function showRoundMessage(text, finalMessage = false) {
    roundMessage.textContent = text;
    roundMessage.classList.add("visible");
    roundMessage.classList.toggle("final", finalMessage);
    messageHideAt = finalMessage ? Infinity : Date.now() + 1800;
}

function tryStartRound() {
    if (roundStarted || !player || hiddenPlayers.length === 0) {
        return;
    }

    roundStarted = true;
    roundDeadline = Date.now() + ROUND_DURATION_MS;
    timerDisplay.textContent = "1:00:00";
    updateFriendsDisplay();
    showRoundMessage("Find all 3 friends!");
}

function finishRound(didWin) {
    roundFinished = true;
    showRoundMessage(didWin ? `You found everyone with ${timerDisplay.textContent} left!`: `Time is up — you found ${foundFriends} of ${hiddenPlayers.length} friends.`,
        true
    );
}

function updateRound() {
    if (!roundStarted) {
        return;
    }

    const now = Date.now();

    if (!roundFinished) {
        const remainingSeconds = Math.max(0, (roundDeadline - now) / 1000);
        const displayedSecond = Math.ceil(remainingSeconds);

        if (displayedSecond !== lastDisplayedSecond) {
            timerDisplay.textContent = formatRoundTime(remainingSeconds);
            lastDisplayedSecond = displayedSecond;
        }

        hiddenPlayers.forEach((friend) => {
            if (friend.found || !player) {
                return;
            }

            const deltaX = player.position.x - friend.character.position.x;
            const deltaZ = player.position.z - friend.character.position.z;

            if (deltaX * deltaX + deltaZ * deltaZ <= FIND_DISTANCE * FIND_DISTANCE) {
                friend.found = true;
                friend.character.visible = false;
                foundFriends += 1;
                updateFriendsDisplay();
                showRoundMessage(`Friend found! ${foundFriends} / ${hiddenPlayers.length}`);
            }
        });

        if (foundFriends === hiddenPlayers.length) {
            finishRound(true);
        } else if (remainingSeconds <= 0) {
            timerDisplay.textContent = "0:00:00";
            finishRound(false);
        }
    }

    if (!roundFinished && now >= messageHideAt) {
        roundMessage.classList.remove("visible");
    }
}

const scene = new THREE.Scene();

scene.background = createSky();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight,0.1,1000);


camera.position.set(0, 1.65, 6);

const renderer = new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(window.innerWidth,window.innerHeight);


renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.05;

renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2));

const gameSounds = createGameSounds(camera);


gameArea.appendChild(renderer.domElement);


const pointerLockControls = new PointerLockControls(camera, renderer.domElement);

renderer.domElement.addEventListener("click", () => {
    if (!pointerLockControls.isLocked) {
        pointerLockControls.lock();
    }
});


const sunlight =createSunlight();

scene.add(sunlight);



const ground = createGround();

scene.add(ground);


const clouds = createClouds();

scene.add(clouds);


const house =createHouse();

house.position.set(0, 0, -8);

scene.add( house);



const car = createCar();

car.position.set(7,0,-2);

scene.add( car);




const tree1 =createTree1();

tree1.position.set(-8, 0, -3);

scene.add( tree1);



const tree2 =createTree2();

tree2.position.set(9, 0, 4);

scene.add(tree2);




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

const perimeterTrees = perimeterTreeLayout.map(([x, y, z, scale, type], index) => {

        const tree = type === 1 ? createTree1() : createTree2();

        tree.position.set(x, y, z);
        tree.scale.setScalar(scale);
        tree.rotation.y = index * 0.83;
        tree.userData.windPhase = index * 1.19 + 0.4;

        scene.add(tree);
        return tree;
    }
);




const bench = createBench();

bench.position.set( -5, 0, 4);

scene.add(bench);




const bushes = createBushes();

bushes.position.set( 2, 0, -4);

scene.add(bushes);




const rocks = createRocks();

scene.add(rocks);

const landscape = createLandscape();

scene.add(landscape);




let hiddenPlayers = [];

createHiddenPlayers().then((friends) => {

        hiddenPlayers = friends;

        hiddenPlayers.forEach(({ character }) => {
            scene.add(character);
        });

        tryStartRound();

    })
    .catch((error) => {
        console.error("Hidden friends failed to load", error);
    });




const breeze = createBreeze();
const windVegetation = [tree1, tree2, ...perimeterTrees, bushes];

tree1.userData.windPhase = 0.2;
tree2.userData.windPhase = 2.1;
bushes.userData.windPhase = 4.4;

scene.add(breeze);




setupControls();


let player = null;

let mixer = null;

let animations = {};

let currentAnimation = null;



createPlayer().then((data) => {

        player = data.player;
        player.visible = false;

        mixer = data.mixer;

        animations = data.animations;


        scene.add( player);


        currentAnimation = animations.idle;

        
        if (animations.run) {

            animations.run.reset().play();

            animations.run.time = 0;
            animations.run.paused = true;

        }

        tryStartRound();

    })
    .catch((error) => {

        console.error("Player failed to load",error);

    });




const clock =new THREE.Clock();



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


    action.reset().fadeIn(0.2).play();


    currentAnimation = action;
}




const moveDirection =new THREE.Vector3();
const cameraForward = new THREE.Vector3();
const cameraRight = new THREE.Vector3();
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

    
    moveDirection.set(0, 0, 0);

    // Use only the camera's horizontal direction so looking up or down does
    // not make the player fly or move more slowly.
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();
    cameraRight.crossVectors(cameraForward, camera.up).normalize();

    if (keys.forward) {
        moveDirection.add(cameraForward);
    }

    if (keys.backward) {
        moveDirection.sub(cameraForward);
    }

    if (keys.left) {
        moveDirection.sub(cameraRight);
    }

    if (keys.right) {
        moveDirection.add(cameraRight);
    }

    const moving = moveDirection.lengthSq() > 0;


    if (moving) {

        moveDirection.normalize();

      

        const speed = keys.crouch ? CROUCH_SPEED : keys.run  ? SPRINT_SPEED : WALK_SPEED;

   

        const targetAngle = Math.atan2( moveDirection.x,moveDirection.z );

       

        let angleDifference =targetAngle -player.rotation.y;

        angleDifference = Math.atan2( Math.sin(angleDifference),Math.cos(angleDifference));

        player.rotation.y += angleDifference *Math.min( 1,10 * delta);

     

        player.position.x += moveDirection.x * speed * delta;

        player.position.z += moveDirection.z * speed * delta;

       

        if (
            animations.run
        ) {

            
            animations.run.timeScale = keys.crouch ? 0.72 : keys.run ? 2 : 1.55;
            animations.run.paused = false;

            if (!animations.run.isRunning()) {

                animations.run .reset().play();

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

    player.scale.y = THREE.MathUtils.lerp( player.scale.y,targetHeightScale,crouchBlend);
    player.rotation.x = THREE.MathUtils.lerp( player.rotation.x,targetForwardLean,crouchBlend);

    updateGameSounds(gameSounds, {
        moving,
        grounded: isGrounded,
        crouching: keys.crouch,
        sprinting: keys.run
    });

}




function updateCamera() {
    if (!player) {
        return;
    }

    const eyeHeight = keys.crouch && isGrounded ? 1.05 : 1.65;

    camera.position.set(
        player.position.x,
        player.position.y + eyeHeight,
        player.position.z
    );
}



function animate() {

    requestAnimationFrame( animate );


    const delta = clock.getDelta();

    const elapsed = clock.elapsedTime;


    

    if (mixer) {

        mixer.update( delta);

    }


    updatePlayer(delta);

    updateRound();


    updateCamera();


    updateBreeze( windVegetation,breeze,elapsed, delta, ground);


    updateClouds( clouds, delta, player?.position);


    updateLandscape( landscape,elapsed );


    renderer.render(scene, camera);

}


animate();




window.addEventListener( "resize", () => {

        camera.aspect = window.innerWidth / window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize( window.innerWidth, window.innerHeight);

    }
);
