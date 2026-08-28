const gamezone = document.getElementById("gameArea");
const player = document.getElementById("player");


let playerX = 100;
let playerY = 100;




const speed = 10;

player.style.left = `${playerX}px`;
player.style.top = `${playerY}px`;


for (let i = 0; i < 3; i++) {

    const box = document.createElement("div");

    box.style.background = "red";
    box.style.width = "50px";
    box.style.height = "50px";
    box.style.position = "absolute";

    const randomX =  Math.random() * (gamezone.clientWidth - 50);

    const randomY = Math.random() * (gamezone.clientHeight - 50);

    box.style.left = `${randomX}px`;
    box.style.top = `${randomY}px`;

    gamezone.appendChild(box);


    box.addEventListener("click", () => {
        box.style.display = "none";

    });

}

window.addEventListener("keydown", movement);

function movement(e) {

    switch (e.key) {

        case "ArrowUp":

            playerY -= speed;

            break;


        case "ArrowDown":

            playerY += speed;

            break;


        case "ArrowLeft":

            playerX -= speed;

            break;


        case "ArrowRight":

            playerX += speed;

            break;


        default:
            return;
    }


    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}