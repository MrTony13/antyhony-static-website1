const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const splash = document.getElementById('splash-screen');
const themeToggle = document.getElementById('themeToggle');

const GRID = 4;
const CELL = 100;
const PADDING = 10;
const SHAPES = ['circle','square','triangle','star','diamond'];
let board = [];

function initBoard(){
  board = Array.from({length:GRID},()=>Array(GRID).fill(null));
  addNew();
  addNew();
}

function addNew(){
  const empties=[];
  for(let r=0;r<GRID;r++) for(let c=0;c<GRID;c++) if(!board[r][c]) empties.push([r,c]);
  if(empties.length===0) return;
  const [r,c] = empties[Math.floor(Math.random()*empties.length)];
  board[r][c] = SHAPES[0];
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // background panel
  const theme = document.body.getAttribute('data-theme');
  ctx.fillStyle = theme==='light' ? '#f0f0f0' : '#262626';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let r=0;r<GRID;r++){
    for(let c=0;c<GRID;c++){
      const x = c*CELL + PADDING;
      const y = r*CELL + PADDING;
      ctx.fillStyle = theme==='light' ? '#e7e7e7' : '#333';
      ctx.fillRect(x,y,CELL - PADDING*2, CELL - PADDING*2, 8);
      const s = board[r][c];
      if(s) drawShape(s, x, y);
    }
  }
}

function drawShape(shape,x,y){
  const cx = x + (CELL - PADDING*2)/2;
  const cy = y + (CELL - PADDING*2)/2;
  const size = 28;
  ctx.save();
  ctx.translate(cx,cy);
  switch(shape){
    case 'circle':
      ctx.fillStyle='#ff5252'; ctx.beginPath(); ctx.arc(0,0,size,0,Math.PI*2); ctx.fill(); break;
    case 'square':
      ctx.fillStyle='#4caf50'; ctx.fillRect(-size,-size,size*2,size*2); break;
    case 'triangle':
      ctx.fillStyle='#42a5f5'; ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(size,size); ctx.lineTo(-size,size); ctx.closePath(); ctx.fill(); break;
    case 'star':
      ctx.fillStyle='#fbc02d'; ctx.beginPath(); for(let i=0;i<5;i++){ ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*size, -Math.sin((18+i*72)*Math.PI/180)*size); ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*size*0.5, -Math.sin((54+i*72)*Math.PI/180)*size*0.5); } ctx.closePath(); ctx.fill(); break;
    case 'diamond':
      ctx.fillStyle='#ba68c8'; ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(size,0); ctx.lineTo(0,size); ctx.lineTo(-size,0); ctx.closePath(); ctx.fill(); break;
  }
  ctx.restore();
}

function shiftRow(row){
  let newRow = row.filter(x=>x);
  for(let i=0;i<newRow.length-1;i++){
    if(newRow[i] === newRow[i+1]){
      const idx = SHAPES.indexOf(newRow[i]);
      if(idx+1 < SHAPES.length){ newRow[i] = SHAPES[idx+1]; newRow.splice(i+1,1); }
    }
  }
  while(newRow.length < GRID) newRow.push(null);
  return newRow;
}

function move(dir){
  let moved=false;
  if(dir === 'left' || dir === 'right'){
    for(let r=0;r<GRID;r++){
      let row = board[r].slice();
      if(dir==='right') row = row.reverse();
      const shifted = shiftRow(row);
      if(dir==='right') shifted.reverse();
      if(JSON.stringify(shifted) !== JSON.stringify(board[r])) moved = true;
      board[r] = shifted;
    }
  } else { // up/down
    for(let c=0;c<GRID;c++){
      let col = board.map(row=>row[c]);
      if(dir==='down') col.reverse();
      const shifted = shiftRow(col);
      if(dir==='down') shifted.reverse();
      for(let r=0;r<GRID;r++){ if(board[r][c] !== shifted[r]) moved = true; board[r][c] = shifted[r]; }
    }
  }
  if(moved) addNew();
  draw();
}

function checkGameOver(){
  for(let r=0;r<GRID;r++) for(let c=0;c<GRID;c++){
    if(!board[r][c]) return false;
    if(r<GRID-1 && board[r][c] === board[r+1][c]) return false;
    if(c<GRID-1 && board[r][c] === board[r][c+1]) return false;
  }
  return true;
}

function endGame(){ window.location.href = 'error.html'; }

document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowLeft') move('left');
  if(e.key === 'ArrowRight') move('right');
  if(e.key === 'ArrowUp') move('up');
  if(e.key === 'ArrowDown') move('down');
  if(checkGameOver()) setTimeout(endGame, 500);
});

startBtn.addEventListener('click', ()=>{
  splash.style.display = 'none';
  canvas.style.display = 'block';
  initBoard();
  draw();
});

// theme toggle
themeToggle.addEventListener('change', (e)=>{
  document.body.setAttribute('data-theme', e.target.value);
  draw();
});

// set initial theme based on select
document.addEventListener('DOMContentLoaded', ()=>{
  const val = themeToggle.value || 'dark';
  document.body.setAttribute('data-theme', val);
});
