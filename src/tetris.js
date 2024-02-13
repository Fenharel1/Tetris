const ele = document.querySelector('.board');
let score = 0;

// board
const nrows = 12;
const ncols = 7;
const board = [];
for(let i = 0; i < nrows; i++){
  board.push(new Array(ncols).fill(0));
}

// body
let body = [];

// pieces

const shape1 = [
  [[1,1],
  [1,1]],
  [[1,1],
  [1,1]],
  [[1,1],
  [1,1]],
  [[1,1],
  [1,1]]
]
const shape2 = [
  [[1,0],
  [1,0]],
  [[1,1],
  [0,0]],
  [[0,1],
  [0,1]],
  [[0,0],
  [1,1]],
]
const shape3 = [
  [[1,1],
  [1,0]],
  [[1,1],
  [0,1]],
  [[0,1],
  [1,1]],
  [[1,0],
  [1,1]],
]

const shape4 = [
  [
    [1,1,1],
    [1,0,0],
    [1,0,0]
  ],
  [
    [1,1,1],
    [0,0,1],
    [0,0,1]
  ],
  [
    [0,0,1],
    [0,0,1],
    [1,1,1]
  ],
  [
    [1,0,0],
    [1,0,0],
    [1,1,1]
  ],
]

const shapes = [shape1, shape2, shape3, shape4]

// piece
class PiecesHandler{
  shape_orientations = []
  shape = [];
  position = [];
  corner = [0,0];
  color = 0;
  rotation = 0;
  constructor(){
    this.GetNewPiece();
  }
  GetNewPiece(){
    this.GetRandomShape();
    this.corner = [0,Math.floor(Math.random()*(ncols-this.shape.length))];
    this.ComputePosition();
    this.color =1+ Math.floor(Math.random()*3);
  }
  GetRandomShape(){
    const value = Math.floor(Math.random()*shapes.length);
    this.shape_orientations = shapes[value]
    this.shape = this.shape_orientations[this.rotation];
  }
  ComputePosition(){
    this.position = this.shape;
    for(let i = 0; i < this.position.length; i++){
      for(let j = 0; j < this.position[0].length; j++){
        if(this.position[i][j] != 0){
          this.position[i][j] = [this.corner[0]+i, this.corner[1]+j];
        }
      }
    }
  }
  Move(direction){
    const canMove = this.CanMove(direction);
    if(!canMove && direction == 0) return false;
    switch(direction){
      // 0 down, 1 left, 2 right
      case 0:
        this.corner[0]++;
        break;
      case 1:
        if(canMove) this.corner[1] = Math.max(0,this.corner[1]-1);
        break;
      case 2:
        if(canMove) this.corner[1] = Math.min(ncols-1,this.corner[1]+1);
        break;
    }
    this.ComputePosition();
    return true;
  }
  CanMove(direction){
    for(let i = 0; i < this.position.length; i++){
      for(let j = 0; j < this.position[0].length; j++){
        if(this.shape[i][j]){
          if(direction == 0){
            if(this.position[i][j][0]+1 >= nrows || 
              (body.find(ele => ele[0]==this.position[i][j][0]+1 && ele[1]==this.position[i][j][1]) != undefined)){
              return false;
            } 
          }
          if(direction == 1){
            if(this.position[i][j][1]-1 < 0 || 
              (body.find(ele => ele[0]==this.position[i][j][0] && ele[1]==this.position[i][j][1]-1) != undefined)){
                return false;
            } 
          }
          if(direction == 2){
            if(this.position[i][j][1]+1 >= ncols || 
              (body.find(ele => ele[0]==this.position[i][j][0] && ele[1]==this.position[i][j][1]+1) != undefined)){
              return false;
            } 
          }
        }
      }
    }
    return true;
  }
  Rotate(){
    const nextRotation = (this.rotation + 1) % 4;
    // if(!CanRotate(this.shape_orientations[nextRotation])) return false;
    this.rotation = nextRotation;
    this.shape = this.shape_orientations[this.rotation];
    this.ComputePosition();
  }
  CanRotate(newshape){
    return true;
  }

}
const pieces = new PiecesHandler();
// show
const colors = ['black','magenta','greenyellow','blue','yellow']

function drawTetris(){
  ele.innerHTML = '';

  board.forEach(row=>row.fill(0));
  body.forEach(ele=>board[ele[0]][ele[1]]=ele[2]);

  pieces.position.forEach(row=>{
    row.forEach(ele=>{
      if (Array.isArray(ele)) {
        let x = ele[0];
        let y = ele[1];
        board[x][y] = pieces.color;
      }
    })
  })

  for(let i = 0; i < nrows; i++){
    const rowdiv = document.createElement('div');
    rowdiv.classList.add('row');
    for(let j = 0; j < ncols; j++){
      const coldiv = document.createElement('div');
      coldiv.style.backgroundColor = colors[board[i][j]];
      rowdiv.appendChild(coldiv)
    }
    ele.appendChild(rowdiv)
  }
  const scoreDiv = document.createElement('div')
  scoreDiv.classList.add('score')
  scoreDiv.innerHTML = 'Your Score: ' + score
  ele.appendChild(scoreDiv)
}

let canPlay = true;
setInterval(()=>{
  drawTetris();
}, 50)
setInterval(()=>{
  if(canPlay){
    const res = pieces.Move(0);
    if(!res){
      pieces.position.forEach(row => {
        row.forEach(ele=>{if(Array.isArray(ele))body.push([ele[0],ele[1],pieces.color])});
      })
      for(let i = 0; i < nrows; i++){
        const rowbody = body.filter(el=>el[0]==i)
        let complete = true;
        for(let j = 0; j < ncols; j++){
          if(rowbody.find(e=>e[1]==j)==undefined)complete=false;
        }
        if(complete){
          body = body.filter(el=>el[0]!=i);
          body.map(el=>{if(el[0] < i) el[0]++})
          score += 100;
        }
      }
      canPlay = body.find(el=>el[0]==2)==undefined
      if(canPlay) pieces.GetNewPiece();
    }
  }
}, 500)

window.addEventListener('keydown',(event)=>{
  if(event.key == 'ArrowLeft' && canPlay) pieces.Move(1);
  if(event.key == 'ArrowRight' && canPlay) pieces.Move(2);
  if(event.key == 'ArrowDown' && canPlay) pieces.Move(0);
  if(event.key == 'ArrowUp' && canPlay) pieces.Rotate();
})