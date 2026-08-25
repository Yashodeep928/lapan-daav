const gamezone = document.getElementById("gameArea")

for(let i =0; i<3; i++){

    const box = document.createElement("div")
    box.style.background = "red"
    box.style.width = "50px"
    box.style.height = "50px"
    box.style.position = "absolute"

   const randomX = Math.random() * window.innerWidth;
   const randomY = Math.random() * window.innerHeight;

   box.style.left = randomX + "px"
   box.style.top = randomY + "px"

   document.body.appendChild(box)

   box.addEventListener("click",()=>{
       console.log("clicked")
      box.style.display="none"
   })

}




