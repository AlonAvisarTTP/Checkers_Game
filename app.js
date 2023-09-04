//getting started & set the starting board

const gameBoard = document.querySelector("#gameboard")
//const gameBoard = document.getElementById("gameboard") //can be also...
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const width = 8
let playerGo = 'black'
playerDisplay.textContent = localStorage.getItem(playerGo)
const startPieces = [
    dark, '', dark, '', dark, '', dark, '',
    '', dark, '', dark, '', dark, '', dark,
    dark, '', dark, '', dark, '', dark, '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', light, '', light, '', light, '', light,
    light, '', light, '', light, '', light, '',
    '', light, '', light, '', light, '', light
]

let blackPieceCount = 12
let whitePieceCount = 12


//display the pieces at the browser ---

//create the board at the innerHTML of #gameboard with 64 squers
function createBoard(){
    startPieces.forEach((startpiece, i)=>{
        const square = document.createElement('div') //creating new html elements
        square.classList.add('square') //setting class name
        
        square.innerHTML = startpiece //adding the start pieces from the "startPieces"
        square.firstChild?.setAttribute('draggable', true) //make the squares with pieces on it draggable

        square.setAttribute('square-id', i) //setting unique id name

        const row = Math.floor((width * 2 - 1 - i)/width) + 1
        if(row % 2 === 0){  //setting class name
            square.classList.add( i % 2 === 0 ? "beige" : "brown")
        }
        else{
            square.classList.add( i % 2 === 0 ? "brown" : "beige")
        }


        gameBoard.append(square)
    })
}

createBoard()






const allSquares = document.querySelectorAll(".square")
//console.log(allSquers) 

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart) //listen-- What is the "from" square
    square.addEventListener('dragover', dragOver) //listen-- which squares the attacker going over
    square.addEventListener('drop', dragDrop) // listen-- What is the "to" square
})

let startPositionId 
let draggedElement 


function dragStart(e){
    startPositionId = e.target.parentNode.getAttribute('square-id') //startPositionId saves the id of the piece that attacks
    draggedElement = e.target

}

function dragOver(e){
    e.preventDefault()
}

function dragDrop(e){
    e.stopPropagation()
    const correctPlayerPlaysNow = draggedElement.firstChild.classList.contains(playerGo) //its bool
    console.log(correctPlayerPlaysNow)
    
    const taken = e.target.classList.contains('piece')
    const opponentGo = playerGo === 'white' ? 'black' : 'white' //its bool


    if(correctPlayerPlaysNow){
        const targetId = Number(e.target.getAttribute('square-id')) || Number(e.target.parentNode.getAttribute('square-id'))
        const startId = Number(startPositionId)
        makeKingPieceIfNecessary(draggedElement, targetId, startId)
        const isCurrentPieceKing = draggedElement.classList.contains("king")
        const valid = checkIfValid(targetId, startId, isCurrentPieceKing)
        const [canEatPiece, eatenPieceId] = canEat(startId, targetId, opponentGo, isCurrentPieceKing)
        
        if(canEatPiece){
            e.target.append(draggedElement)
            const eatenOpponent = document.querySelector(`[square-id="${eatenPieceId}"]`).firstChild;
            updatePieceCount(playerGo)
            eatenOpponent.remove()
            if(!checkIfCanEatMore(targetId, opponentGo)){
                changePlayer()
            } else {
                infoDisplay.textContent = "You can eat more"
                setTimeout(()=>infoDisplay.textContent="",2000)    
            }
        }

        else if(taken || !valid ){
            infoDisplay.textContent = "you cannot go here :("
            setTimeout(()=>infoDisplay.textContent="",2000) //2 seconds
        }

        else if(valid){
            e.target.append(draggedElement)
            changePlayer()
        }
    }

    
}

function updatePieceCount(playerGo){
    if(playerGo === "black") blackPieceCount--
    else whitePieceCount--
}


function makeKingPieceIfNecessary(piece, targetId, startId) {
    //if(targetId===startId) return false
    if((56 <= targetId && targetId <= 63)) { //reached final or first row -> make king
        piece.classList.add("king")
    }
}

function canKingPieceMove(startId, targetId) { //for backwards
    return (startId - width - 1 === targetId || startId - width + 1 === targetId)
}

function canKingPieceEatBackwards(startId, targetId, opponentColor) {
    let canEatPiece = false;
    let eatenPieceId = -1
 
    if(startId - 2 * width - 2 === targetId) //wants to eat the opponent piece
    {
        eatenPieceId = startId - width - 1

        let isOpponent = document.querySelector(`[square-id="${eatenPieceId}"]`);
        isOpponent = isOpponent.firstChild?.firstChild?.classList.contains(opponentColor)

        canEatPiece = isOpponent
    }
    else if(startId - 2 * width + 2 === targetId){
        eatenPieceId = startId - width + 1
        let isOpponent = document.querySelector(`[square-id="${eatenPieceId}"]`);
        isOpponent = isOpponent.firstChild?.firstChild?.classList.contains(opponentColor)
        
        canEatPiece = isOpponent
    }

    return [canEatPiece, eatenPieceId];
}

function canEat(startId, targetId, opponentColor, isCurrentKingPiece) {
    let canEatPiece = false;
    let eatenPieceId = -1
 
    if(startId + 2 * width + 2 === targetId) //wants to eat the opponent piece
    {
        let isOpponent = document.querySelector(`[square-id="${startId + width + 1}"]`); 
        isOpponent = isOpponent.firstChild?.firstChild?.classList.contains(opponentColor)

        eatenPieceId = startId + width + 1
        canEatPiece = isOpponent
    }
    else if(startId + 2 * width - 2 === targetId){
        let isOpponent = document.querySelector(`[square-id="${startId + width - 1}"]`);
        isOpponent = isOpponent.firstChild?.firstChild?.classList.contains(opponentColor) //the '?' checking if there is first-childs.... null safety

        eatenPieceId = startId + width - 1
        canEatPiece = isOpponent
    }
    
    if(!canEatPiece && isCurrentKingPiece) {
        [canEatPiece, eatenPieceId] = canKingPieceEatBackwards(startId, targetId, opponentColor)
    }

    return [canEatPiece, eatenPieceId];
}

function checkIfCanEatMore(targetId, opponentColor) {
    let rightSpot = document.querySelector(`[square-id="${targetId + 2 * width - 2}"]`);
    let leftSpot = document.querySelector(`[square-id="${targetId + 2 * width + 2}"]`);
    let canEatMore = false

    if(rightSpot && !rightSpot.firstChild?.classList.contains("piece")) { //free spot can potentially move to there to eat
        let isOpponentPieceExists = document.querySelector(`[square-id="${targetId + width - 1}"]`)?.firstChild?.firstChild?.classList.contains(opponentColor)

        canEatMore = isOpponentPieceExists //the spot where we suppose to land is empty and in between we have opponent piece - i.e. we can eat it
    }
    else if(leftSpot && !leftSpot.firstChild?.classList.contains("piece")) {
        let isOpponentPieceExists = document.querySelector(`[square-id="${targetId + width + 1}"]`)?.firstChild?.firstChild?.classList.contains(opponentColor)

        canEatMore = isOpponentPieceExists //the spot where we suppose to land is empty and in between we have opponent piece - i.e. we can eat it
    }

    return canEatMore
}

function checkIfValid(targetId, startId, isCurrentPieceKing){
    console.log('targetId', targetId)
    console.log('startId', startId)
    console.log("king", isCurrentPieceKing)
   
    if(
        startId + width + 1 === targetId ||
        startId + width - 1 === targetId 
    ){
        return true
    }
    else if(isCurrentPieceKing)
    {
        return canKingPieceMove(startId, targetId)
    } 
    
    return false
}

function changePlayer(){
    displayWinner()

    if(playerGo === 'black'){
        reverseIds() //flipping the board
        playerGo = 'white'
        playerDisplay.textContent = localStorage.getItem(playerGo)
    }
    else{
        revertIds() //flipping the board
        playerGo = 'black'
        playerDisplay.textContent = localStorage.getItem(playerGo)
    }
}

function displayWinner(){
    const winnerPlayerName = blackPieceCount === 0? localStorage.getItem("black") : whitePieceCount===0 ? localStorage.getItem("white") : null

    if(winnerPlayerName){
        const response = confirm(`Player ${winnerPlayerName} Is the winner!!!! \n Do you want to play again? 😍 `)
        if (response){
            window.location.reload()
        }
        if (!response){
            window.location.replace("./login.html")
        }
    }

}

function reverseIds(){
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i)=> square.setAttribute('square-id', (width*width-1) - i))
}

function revertIds(){
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i)=> square.setAttribute('square-id', i))
}


