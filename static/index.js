/*****************************************************************************
Tim Kim and Tae Jin Kim
Web Security - Undergraduate
Homework #1
*****************************************************************************/

$(document).ready(function () {

  //Define score board and fill with 0's
  //Requires 21 rows/columns because of offset square in styling the canvas
  var scoreBoard = [];
  var playerOne; //start player 1 with black markers

  var totalPlayers;

  //Initialize the canvas
  var canvas = document.getElementById("board");
  var context = canvas.getContext("2d");

  //Arbitrarily chose 1.25 as factor for grid size
  var width = window.innerHeight / 1.5;
  var square = width / 20; //20 so we can have 19 intersections

  context.canvas.width = width + square;
  context.canvas.height = width + square;
  drawBoard();

  //Setup the socket
  var socket = io.connect("http://127.0.0.1:1414");


  //Send coordinates of stone placed
  canvas.onclick = function(mousePointer) {
    var x = Math.floor(mousePointer.offsetX / square);
    var y = Math.floor(mousePointer.offsetY / square);
    socket.emit('click', {coordinates: [{x,y}]});
  }


  //get number of users
  socket.on('players_connected', function (p_len) {
    if (totalPlayers == 1) {
      //Reset the game board
      canvas.width = canvas.width;
      drawBoard();
    }
    totalPlayers = p_len
    console.log('num players: ' + totalPlayers)  
  });


  //Update stones placed
  socket.on('player_info', function (data) {
  
    var p_id = data.id;
    var p_num = data.p_num;
    var p_len = data.p_len;
    var x = data.stone[0].x;
    var y = data.stone[0].y;

    console.log('update: p num = ' + p_num);
    console.log('update: p len = ' + p_len);
    console.log('update: x = ' + x + ' y = ' + y);

    //Placing stones    
    if ((x > 0 && y > 0) && scoreBoard[x][y] == 0) {
      switch(p_len)
      {
        //One Player
        case 1:
          if (playerOne) {
            setMarker(x, y, 1);
            playerOne = false;
          }
          else {
            setMarker(x, y, 2);
            playerOne = true;
          }
          break;
        
        //Two+ Players
        default:
          if (p_num == 1) {
            if (playerOne) {
              setMarker(x, y, 1);
              playerOne = false;
            }
            else {
              alert("It is not your turn yet!")
            }
          }
          else if (p_num == 2) {
            if (!playerOne) {
              setMarker(x, y, 2);
              playerOne = true;
            }
            else {
              alert("It is not your turn yet!")
            }
          }
          else {
            alert("There can only be at MOST, 2 players! Be a spectator!");
          }
          break;
      }
    }
   });


  //Function to draw empty game board and setup scoreBoard
  function drawBoard() {
    for (var i=0; i<20; i++) {
      playerOne = true;

      //Horizontal gridlines
      context.moveTo(square, square + (square * i));
      context.lineTo(width, square + (square * i));
      
      //Vertical gridlines
      context.moveTo(square + (square * i), square);
      context.lineTo(square + (square * i), width);
      
      context.strokeStyle = "#000000";
      context.stroke();
    }
    
    //Initialize scoreBoard to 0
    for (var i=0; i<21; i++) {
      scoreBoard[i] = [];
      for (var j=0; j<21; j++) {
        scoreBoard[i][j] = 0;
      }
    }
  }


  //Function to draw circle marker for each move
  function setMarker(x, y, player, callback) {
    console.log('x: ' + x + ' y: ' + y)
    
    context.beginPath();
    context.arc(
      x * square, 
      y * square, 
      square / 2.5, 
      0, 
      2*Math.PI
    )
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(0,0,0, 0.25)'
    context.stroke();
    context.closePath();
    
    var gradiant;
    if (player == 1) {
      gradient = context.createRadialGradient(
        x * square, 
        y * square,
        square / 5, 
        x * square, 
        y * square, 
        square / 2.5
      )
      gradient.addColorStop(0, "#555555");
      gradient.addColorStop(1, "#000000");
      context.fillStyle = gradient;
      
    } else {
      gradient = context.createRadialGradient(
        x * square, 
        y * square,
        square / 5, 
        x * square, 
        y * square, 
        square / 2.5
      )
      gradient.addColorStop(0, "#FFFFFF");
      gradient.addColorStop(1, "#AAAAAA");
      context.fillStyle = gradient;
    }
    
    context.fill();
    scoreBoard[x][y] = player;
    
    //Added a timeout because just wanted the final marker to appear before
    //alerting the player that they won the game
    if (checkForFiveRow(player)) {
      setTimeout(function() { 
        alert("Player " + player + " is the winner!");
        
        //Reset the game board
        canvas.width = canvas.width;
        drawBoard();
      }, 100);
    }
  }


  //Function to validate win condition
  function checkForFiveRow(player) {  
    //Horizonal/Vertical checks 
    for (var j=1; j<21 - 5 ; j++ ){
        for (var i = 1; i<21; i++){
            if (scoreBoard[i][j] == player && 
              scoreBoard[i][j+1] == player && 
              scoreBoard[i][j+2] == player && 
              scoreBoard[i][j+3] == player &&
              scoreBoard[i][j+4] == player) {
                return true;
            }           
        }
    }
    for (var i=1; i<21 - 5 ; i++ ){
        for (var j=1; j<21; j++){
          if (scoreBoard[i][j] == player && 
            scoreBoard[i+1][j] == player && 
            scoreBoard[i+2][j] == player && 
            scoreBoard[i+3][j] == player &&
            scoreBoard[i+4][j] == player) {
              return true;
          }         
        }
    }
    
    //Diagonal checks 
    for (var i=5; i<21 ; i++ ){
        for (var j=1; j<21 - 5; j++){
          if (scoreBoard[i][j] == player && 
            scoreBoard[i-1][j+1] == player && 
            scoreBoard[i-2][j+2] == player && 
            scoreBoard[i-3][j+3] == player &&
            scoreBoard[i-4][j+4] == player) {
              return true;
          }         
        }
    }
    for (var i=5; i<21 ; i++ ){
        for (var j=5; j<21; j++){
          if (scoreBoard[i][j] == player && 
            scoreBoard[i-1][j-1] == player && 
            scoreBoard[i-2][j-2] == player && 
            scoreBoard[i-3][j-3] == player &&
            scoreBoard[i-4][j-4] == player) {
              return true;
          }         
        }
    }
    return false;
  }

});