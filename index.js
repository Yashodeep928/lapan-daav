       const gamezone = document.getElementById("gameArea");
        const player = document.getElementById("player");


        for (let i = 0; i < 3; i++) {

            const box = document.createElement("div");

            box.style.background = "red";
            box.style.width = "50px";
            box.style.height = "50px";

            box.style.position = "absolute";

            // Box size
            const boxWidth = 50;
            const boxHeight = 50;

          
            const randomX =
                Math.random() * (gamezone.clientWidth - boxWidth);

            const randomY = Math.random() * (gamezone.clientHeight - boxHeight);

            box.style.left = `${randomX}px`;
            box.style.top = `${randomY}px`;

          
            gamezone.appendChild(box);

            // Remove box when clicked
            box.addEventListener("click", () => {

                console.log("clicked");

                box.style.display = "none";
            });
        }


        const speed = 10;

        window.addEventListener("keydown", Movement);


        function Movement(e) {

            e.preventDefault();

            // Current player position
            let topPos = parseInt(player.style.top);
            let leftPos = parseInt(player.style.left);


            // Player dimensions
            const playerWidth = player.offsetWidth;
            const playerHeight = player.offsetHeight;


            // Game area boundaries
            const maxLeft =
                gamezone.clientWidth - playerWidth;

            const maxTop =
                gamezone.clientHeight - playerHeight;


            // Decide movement
            switch (e.key) {

                case "ArrowUp":

                    topPos = Math.max(
                        0,
                        topPos - speed
                    );

                    break;


                case "ArrowDown":

                    topPos = Math.min(
                        maxTop,
                        topPos + speed
                    );

                    break;


                case "ArrowLeft":

                    leftPos = Math.max(
                        0,
                        leftPos - speed
                    );

                    break;


                case "ArrowRight":

                    leftPos = Math.min(
                        maxLeft,
                        leftPos + speed
                    );

                    break;


                default:

                    return;
            }


            // Update player position
            player.style.top = `${topPos}px`;
            player.style.left = `${leftPos}px`;
        }