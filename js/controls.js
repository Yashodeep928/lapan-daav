const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    crouch: false
};

function setKeyState(code, value) {
    switch (code) {
        case "KeyW":
        case "ArrowUp":
            keys.forward = value;
            break;

        case "KeyS":
        case "ArrowDown":
            keys.backward = value;
            break;

        case "KeyA":
        case "ArrowLeft":
            keys.left = value;
            break;

        case "KeyD":
        case "ArrowRight":
            keys.right = value;
            break;

        case "ShiftLeft":
        case "ShiftRight":
            keys.run = value;
            break;

        case "Space":
            keys.jump = value;
            break;

        case "ControlLeft":
        case "ControlRight":
        case "KeyC":
            keys.crouch = value;
            break;
    }
}

export function setupControls() {
    window.addEventListener("keydown", (event) => {
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
            event.preventDefault();
        }
        setKeyState(event.code, true);
    });

    window.addEventListener("keyup", (event) => {
        setKeyState(event.code, false);
    });

    window.addEventListener("blur", () => {
        Object.keys(keys).forEach((key) => {
            keys[key] = false;
        });
    });
}

export { keys };
