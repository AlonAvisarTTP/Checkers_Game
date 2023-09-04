let submitButton = document.getElementById("button")
let whitePlayer = document.getElementById("white_player")
let blackPlayer = document.getElementById("black_player")

submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("white", whitePlayer.value)
    localStorage.setItem("black", blackPlayer.value)
    window.location.replace("./index.html");
})