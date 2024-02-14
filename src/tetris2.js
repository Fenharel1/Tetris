
import { ConstantColorFactor } from 'three';
import tetrisShapes from './shapes'

class Game {
  constructor(nrows, ncols, shapes, drawGame) {
    this.nrows = nrows;
    this.ncols = ncols;
    this.board = this.initBoard();
    this.score = 0;
    this.pointsComplete = 100;
    this.body = [];
    this.drawGame = drawGame;
    this.pieces = new PiecesHandler(shapes, ncols, nrows );
  }
  initBoard() {
    const board = [];
    for (let i = 0; i < this.nrows; i++) board.push(new Array(this.ncols).fill(0));
    return board;
  }
  updateBoard() {
    this.board.forEach((row) => row.fill(0));
    this.body.forEach((el) => (this.board[el[0]][el[1]] = el[2]));
    this.pieces.position.forEach((row) =>
      row.forEach((cell) => {
        if (Array.isArray(cell)) this.board[cell[0]][cell[1]] = this.pieces.value;
      })
    );
  }
  start() {
    this.body = [];
    this.pieces.GetNewPiece();
    this.idDrawInterval = setInterval(() => {
      this.updateBoard();
      this.drawGame(this.board);
    }, 50);
    this.idMoveDown = setInterval(() => {
      this.pieces.Body = this.body.slice();
      const res = this.pieces.MoveDown();
      if(!res) this.onBlockMove();
    }, 400)
  }
  stop() {
    clearInterval(this.idDrawInterval);
    clearInterval(this.idMoveDown);
  }
  onBlockMove() {
    this.pieces.position.forEach((row) => {
      row.forEach((ele) => {
        if (Array.isArray(ele)){ this.body.push([ele[0], ele[1], this.pieces.value])};
      });
    });
    for (let i = 0; i < this.nrows; i++) {
      const rowbody = this.body.filter((el) => el[0] == i);
      let complete = true;
      for (let j = 0; j < this.ncols; j++) {
        if (rowbody.find((e) => e[1] == j) == undefined) complete = false;
      }
      if (complete) {
        this.body = this.body.filter((el) => el[0] != i);
        this.body.map((el) => { if (el[0] < i) el[0]++; });
        this.score += this.pointsComplete;
      }
    }
    if(this.body.find((el) => el[0] == 2) == undefined){
      this.pieces.GetNewPiece();
    }else{
      this.stop();
    }
  }
}

class PiecesHandler{
  constructor(shapes, ncols, nrows){
    this.shapes = shapes;
    this.corner = [0,0];
    this.orientation = 0;
    this.ncols = ncols
    this.nrows = nrows
    this.value = 0;
    this.body = null
    this.randomIdx = 0;
  }
  
  set Body(newbody){this.body=newbody}
  
  GetNewPiece(){
    this.position = null;
    this.GetRandomShape();
    this.GetRandomCorner();
    this.position = this.getComputedPosition();
    this.value = 1 + Math.floor(Math.random()*this.shapes.length);
  }
  GetRandomShape(){
    this.randomIdx = Math.floor(Math.random()*this.shapes.length);
  }
  GetRandomCorner(){
    this.corner = [0,Math.floor(Math.random()*(this.ncols-this.shapes[this.randomIdx][this.orientation].length))]
  }
  getComputedPosition(){
    const positions = []
    for(let i = 0; i < this.shapes[this.randomIdx][this.orientation].length; i++){
      positions.push(new Array(this.shapes[this.randomIdx][this.orientation][0].length).fill(0) );
    } 
    for(let i = 0; i < positions.length; i++){
      for(let j = 0; j < positions[0].length; j++){
        if(this.shapes[this.randomIdx][this.orientation][i][j] != 0){
          positions[i][j] = [this.corner[0]+i, this.corner[1]+j];
        }
      }
    }
    return positions;
  }
  MoveRight(){ this.#Move(0); }
  MoveLeft(){ this.#Move(1); }
  MoveDown(){ return this.#Move(2); }
  #Move(direction){
    const canMove = this.#CanMove(direction);
    if(!canMove && direction == 2) return false;
    if(canMove){
      if(direction == 2) this.corner[0]++;
      if(direction == 1) this.corner[1]=Math.max(0,this.corner[1]-1);
      if(direction == 0) this.corner[1]=Math.min(this.ncols-this.shapes[this.randomIdx][this.orientation].length, this.corner[1]+1);
    }
    this.position = this.getComputedPosition();
    return true;
  }
  #CanMove(direction){
    for(let i = 0; i < this.position.length; i++){
      for(let j = 0; j < this.position[0].length; j++)
        if(this.shapes[this.randomIdx][this.orientation][i][j]){
          const neighbor = [...this.position[i][j]];
          if(direction == 2) neighbor[0]++;
          if(direction == 0) neighbor[1]++;
          if(direction == 1) neighbor[1]--;
          if(neighbor[0] >= this.nrows || neighbor[1] >= this.ncols || neighbor[1] < 0 ||
            (this.body.find(cell=>cell[0]==neighbor[0] && cell[1]==neighbor[1])!=undefined)){
              return false
            }
        }
    }
    return true;
  }
  Rotate(){
    const nextrotation = (this.orientation + 1)%4;
    if(!this.#CanRotate(nextrotation)) return
    this.position = this.getComputedPosition();
  }
  #CanRotate(nextRotation){
    const oldOrientation = this.orientation;
    this.orientation = nextRotation;
    const positions = this.getComputedPosition();
    for(let i = 0; i < positions.length; i++){
      for(let j = 0; j < positions[0].length; j++){
        if(this.shapes[this.randomIdx][this.orientation][i][j]){
          let x = positions[i][j][0]
          let y = positions[i][j][1]
          if(this.body.find(cell=>cell[0]==x && cell[1]==y) != undefined){
            this.orientation = oldOrientation;
            return false;
          }
        }
      }
    }  
    return true;
  }
}

class Controls {
  constructor(game, element) {
    this.game = game;
    this.domElement = element;
    this.moveControlsListener = (event) => {this.moveControlsBehavior(event)}
  }
  initListeners() {
    this.domElement.addEventListener("keydown",this.moveControlsListener);
  }
  removeListeners() {
    this.domElement.removeEventListener("keydown",this.moveControlsListener);
  }
  moveControlsBehavior(event) {
    this.game.pieces.Body = this.game.body;
    switch (event.key) {
      case "ArrowLeft":
        this.game.pieces.MoveLeft();
        break;
      case "ArrowRight":
        this.game.pieces.MoveRight();
        break;
      case "ArrowDown":
        this.game.pieces.MoveDown();
        break;
      case "ArrowUp":
        this.game.pieces.Rotate();
        break;
    }
  }
}

function drawOnHtml(board){
  const ele = document.querySelector('.board') 
  ele.innerHTML = ""
  const colors = ["black","red","yellow","skyblue","green","pink"]
  for(let i = 0; i < board.length; i++){
    const rowdiv = document.createElement('div');
    rowdiv.classList.add('row');
    for(let j = 0; j < board[0].length; j++){
      const coldiv = document.createElement('div');
      coldiv.style.backgroundColor = colors[board[i][j]];
      rowdiv.appendChild(coldiv)
    }
    ele.appendChild(rowdiv)
  }
  const scorediv = document.querySelector('.score');
  scorediv.innerTEXT = "Your Score is " + 100;
}


const board = document.querySelector('.board')
const game = new Game(12,10,tetrisShapes,drawOnHtml);
const controls = new Controls(game, window);

function init(){
  controls.initListeners();
  game.start();
}

function stop(){
  controls.removeListeners();
  game.stop();
}

document.getElementById('btn_start').addEventListener('click', init)
document.getElementById('btn_stop').addEventListener('click', stop)