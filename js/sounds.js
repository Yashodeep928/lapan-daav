import * as THREE from "three";

export function createGameSounds(camera) {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const wind = new THREE.Audio(listener);
    const running = new THREE.Audio(listener);
    const jump = new THREE.Audio(listener);
    const loader = new THREE.AudioLoader();

    wind.setLoop(true);
    wind.setVolume(0.18);
    wind.setPlaybackRate(1.12);

    running.setLoop(true);
    running.setVolume(0.72);

    jump.setLoop(false);
    jump.setVolume(0.58);

    const soundscape = {
        listener,
        wind,
        running,
        jump,
        unlocked: false,
        runningRate: 0
    };

    function loadSound(filename, sound, onReady) {
        const url = new URL(`../sounds/${filename}`, import.meta.url).href;

        loader.load(
            url,
            (buffer) => {
                sound.setBuffer(buffer);
                onReady?.();
            },
            undefined,
            (error) => {
                console.warn(`Could not load ${filename}`, error);
            }
        );
    }

    loadSound("wind.mp3", wind, () => {
        if (soundscape.unlocked && !wind.isPlaying) {
            wind.play();
        }
    });
    loadSound("running.mp3", running);
    loadSound("jump.mp3", jump);

    const unlockAudio = () => {
        listener.context.resume().then(() => {
            soundscape.unlocked = true;

            if (wind.buffer && !wind.isPlaying) {
                wind.play();
            }
        });
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    return soundscape;
}

export function updateGameSounds(soundscape, state) {
    if (!soundscape.unlocked) {
        return;
    }

    const { wind, running } = soundscape;

    // Keep the ambient track continuous after focus changes or audio interruptions.
    if (wind.buffer && !wind.isPlaying) {
        wind.play();
    }

    const shouldPlayRunning = state.moving && state.grounded;

    // Keep the ambience playing, but make room in the mix for footsteps.
    wind.setVolume(shouldPlayRunning ? 0.1 : 0.18);

    if (shouldPlayRunning && running.buffer) {
        const playbackRate = state.crouching
            ? 0.68
            : state.sprinting
                ? 1.35
                : 1;

        if (soundscape.runningRate !== playbackRate) {
            running.setPlaybackRate(playbackRate);
            soundscape.runningRate = playbackRate;
        }

        if (!running.isPlaying) {
            running.play();
        }
    } else if (running.isPlaying) {
        running.stop();
    }
}

export function playJumpSound(soundscape) {
    const { jump } = soundscape;

    if (!soundscape.unlocked || !jump.buffer) {
        return;
    }

    if (jump.isPlaying) {
        jump.stop();
    }

    jump.play();
}
