/* Mini Game Challenge — 10 hard mini-games, 1 minute each.
   Scoring: completion% * 10 marks. Auto-advance. Final /100.
   All games are self-contained and call finishGame(progress0to1).
*/

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const welcome = document.getElementById('welcome');
const hud = document.getElementById('hud');
const finalView = document.getElementById('final');
const gameArea = document.getElementById('gameArea');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const gameNumEl = document.getElementById('gameNumber');
const finalScoreEl = document.getElementById('finalScore');
const gameTitleEl = document.getElementById('gameTitle');
const hintEl = document.getElementById('hint');

let currentGame = 0;
let totalScore = 0;
let timeLeft = 60;
let timerId = null;
let cleanupCurrent = () => {}; // per-game cleanup

const GAMES = [
  { title: "Maze Runner 🧩", fn: startMazeRunner, hint: "Use arrow keys to escape the maze from 🟦 start to 🟩 goal." },
  { title: "Dodge Rain 🚧", fn: startDodge, hint: "Move with ← → to avoid falling blocks. Survive & progress." },
  { title: "Sudoku Mini 4×4 🔢", fn: startSudoku4, hint: "Fill 1-4. Each correct cell increases completion." },
  { title: "Memory Flip Advanced 🧠", fn: startMemoryAdv, hint: "Match all pairs. More matches = more score." },
  { title: "Math Speed Drill ➕✖️➗", fn: startMathDrill, hint: "Answer quickly. Accuracy boosts completion." },
  { title: "Simon Says 🎶", fn: startSimon, hint: "Repeat the flashing sequence. Longer streak = higher score." },
  { title: "Typing Accuracy ⌨️", fn: startTyping, hint: "Type the text with accuracy. Correct chars = progress." },
  { title: "Snake Advanced 🐍", fn: startSnake, hint: "Use arrows. Eat 10 apples for full completion." },
  { title: "Sliding Puzzle 3×3 🖼️", fn: startSlidingPuzzle, hint: "Arrange tiles to the correct order." },
  { title: "Reaction Duel ⚡", fn: startReactionDuel, hint: "Wait for GREEN then click fast. 5 rounds." },
];

// ---------- Game flow ----------
startBtn?.addEventListener('click', startChallenge);
restartBtn?.addEventListener('click', () => location.reload());

function startChallenge() {
  welcome.classList.add('hidden');
  finalView.classList.add('hidden');
  hud.classList.remove('hidden');
  currentGame = 0;
  totalScore = 0;
  scoreEl.textContent = 0;
  nextGame();
}

function nextGame() {
  // cleanup previous game artifacts
  try { cleanupCurrent(); } catch {}
  cleanupCurrent = () => {};
  clearInterval(timerId);

  if (currentGame >= GAMES.length) return endChallenge();

  const g = GAMES[currentGame];
  gameNumEl.textContent = currentGame + 1;
  gameTitleEl.textContent = g.title;
  hintEl.textContent = g.hint || "";
  gameArea.innerHTML = "";
  timeLeft = 60;
  timerEl.textContent = timeLeft;

  // start timer
  timerId = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      finishGame(0); // time over
    }
  }, 1000);

  // start the game
  g.fn();
}

function finishGame(progress) {
  clearInterval(timerId);
  progress = Math.max(0, Math.min(1, progress || 0)); // clamp
  const marks = Math.round(progress * 10); // 0-10
  totalScore += marks;
  scoreEl.textContent = totalScore;
  currentGame++;
  setTimeout(nextGame, 700);
}

function endChallenge() {
  hud.classList.add('hidden');
  finalView.classList.remove('hidden');
  finalScoreEl.textContent = totalScore;
}

// Utilities
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

// ==================================================
// 1) Maze Runner — small DFS maze, arrows to move
// ==================================================
function startMazeRunner() {
  const W = 13, H = 9;         // odd sizes for walls
  const cellSize = 32;
  const canvas = document.createElement('canvas');
  canvas.width = W * cellSize;
  canvas.height = H * cellSize;
  canvas.className = 'canvas-wrap';
  gameArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Build grid (1 wall, 0 path)
  const grid = Array.from({length:H}, ()=>Array(W).fill(1));
  function carve(x,y){
    grid[y][x]=0;
    const dirs = shuffle([[2,0],[ -2,0],[0,2],[0,-2]]);
    for(const [dx,dy] of dirs){
      const nx=x+dx, ny=y+dy;
      if(ny>0 && ny<H-1 && nx>0 && nx<W-1 && grid[ny][nx]===1){
        grid[y+dy/2][x+dx/2]=0;
        carve(nx,ny);
      }
    }
  }
  carve(1,1);

  const start = {x:1,y:1};                 // start cell
  const goal = {x:W-2,y:H-2};              // goal cell
  let player = {x:1,y:1};                  // player cell

  // Manhattan distance progress
  const baseDist = Math.abs(goal.x-start.x)+Math.abs(goal.y-start.y);

  function draw(){
    ctx.fillStyle = '#0b0f1a';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(grid[y][x]===1){
          ctx.fillStyle = '#202743';
          ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
        }else{
          ctx.fillStyle = '#151b32';
          ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
        }
      }
    }
    // goal
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(goal.x*cellSize+6, goal.y*cellSize+6, cellSize-12, cellSize-12);
    // start
    ctx.fillStyle = '#3498db';
    ctx.fillRect(start.x*cellSize+8, start.y*cellSize+8, cellSize-16, cellSize-16);
    // player
    ctx.fillStyle = '#ffca28';
    ctx.beginPath();
    ctx.arc(player.x*cellSize+cellSize/2, player.y*cellSize+cellSize/2, 10, 0, Math.PI*2);
    ctx.fill();
  }
  draw();

  function tryMove(dx,dy){
    const nx = player.x + dx, ny = player.y + dy;
    if (nx>=0 && nx<W && ny>=0 && ny<H && grid[ny][nx]===0) {
      player.x = nx; player.y = ny; draw();
      const dist = Math.abs(goal.x-player.x)+Math.abs(goal.y-player.y);
      const progress = 1 - (dist / baseDist);
      if (player.x===goal.x && player.y===goal.y) return finishGame(1);
      // award partial if timer ends later
      lastProgress = Math.max(lastProgress, progress);
    }
  }

  let lastProgress = 0;
  const onKey = (e)=>{
    if(e.key==='ArrowLeft') tryMove(-1,0);
    else if(e.key==='ArrowRight') tryMove(1,0);
    else if(e.key==='ArrowUp') tryMove(0,-1);
    else if(e.key==='ArrowDown') tryMove(0,1);
  };
  window.addEventListener('keydown', onKey);

  cleanupCurrent = ()=>{
    window.removeEventListener('keydown', onKey);
    finishGame(lastProgress); // if user navigates away
  };
}

// ==================================================
// 2) Dodge Rain — avoid falling blocks
// ==================================================
function startDodge() {
  const W=640, H=400;
  const canvas = document.createElement('canvas');
  canvas.width=W; canvas.height=H; canvas.className='canvas-wrap';
  gameArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let player = {x:W/2-20,y:H-30,w:40,h:12,spd:7};
  let obstacles=[];
  let alive=true, elapsed=0;

  function spawn(){
    obstacles.push({x:randInt(0,W-20),y:-20,w:randInt(12,28),h:randInt(12,28),v:randInt(3,7)});
  }
  let spawnId = setInterval(spawn, 300);

  const keys = {};
  const kd = e=>keys[e.key]=true, ku = e=>keys[e.key]=false;
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);

  function step(){
    if(!alive) return;
    elapsed += 1/60;
    // move player
    if(keys['ArrowLeft']) player.x-=player.spd;
    if(keys['ArrowRight']) player.x+=player.spd;
    player.x=Math.max(0,Math.min(W-player.w,player.x));

    // move obstacles
    for(const o of obstacles){ o.y += o.v; }
    obstacles = obstacles.filter(o=>o.y<H+40);

    // collision
    for(const o of obstacles){
      if (player.x<o.x+o.w && player.x+player.w>o.x && player.y<o.y+o.h && player.y+player.h>o.y){
        alive=false;
      }
    }

    // render
    ctx.fillStyle='#0b0f1a'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#1e2b55'; ctx.fillRect(0,H-50,W,50);
    ctx.fillStyle='#ffca28'; ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.fillStyle='#e74c3c';
    for(const o of obstacles){ ctx.fillRect(o.x,o.y,o.w,o.h); }

    requestAnimationFrame(step);
  }
  step();

  // progress by survival time within 60s
  let progId=setInterval(()=>{
    const p = Math.min(1, elapsed/60);
    lastProgress = Math.max(lastProgress, p);
    if(!alive){ // finish with partial
      clearInterval(progId);
      clearInterval(spawnId);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      finishGame(lastProgress);
    }
  }, 250);

  let lastProgress = 0;

  cleanupCurrent = ()=>{
    clearInterval(spawnId);
    clearInterval(progId);
    window.removeEventListener('keydown', kd);
    window.removeEventListener('keyup', ku);
    finishGame(lastProgress);
  };
}

// ==================================================
// 3) Sudoku Mini 4×4 — progress by correct fills
// ==================================================
function startSudoku4(){
  // 0 = empty; solution ensures unique numbers 1-4
  const puzzle = [
    [0,0,3,4],
    [3,4,0,0],
    [0,0,4,2],
    [4,2,0,0],
  ];
  const solution = [
    [2,1,3,4],
    [3,4,2,1],
    [1,3,4,2],
    [4,2,1,3],
  ];

  const grid = document.createElement('div');
  grid.className='grid';
  grid.style.gridTemplateColumns='repeat(4, 1fr)';
  grid.style.maxWidth='360px';
  grid.style.margin='0 auto';

  let correct=0, total=0;

  for(let r=0;r<4;r++){
    for(let c=0;c<4;c++){
      const cell = document.createElement('div');
      cell.className='tile';
      if(puzzle[r][c]!==0){
        cell.textContent = puzzle[r][c];
        cell.style.background='#26325c';
      }else{
        total++;
        const input = document.createElement('input');
        input.type='number'; input.min=1; input.max=4;
        input.className='input'; input.style.width='56px'; input.style.textAlign='center';
        input.addEventListener('input', ()=>{
          const val = parseInt(input.value,10);
          if(val===solution[r][c]) {
            if(!input.dataset.ok){ correct++; input.dataset.ok=1; }
            input.style.borderColor='#2ecc71';
          } else {
            if(input.dataset.ok){ correct--; delete input.dataset.ok; }
            input.style.borderColor='#e74c3c';
          }
          const prog = correct/total;
          if(prog>=1) finishGame(1); else latest = Math.max(latest, prog);
        });
        cell.appendChild(input);
      }
      grid.appendChild(cell);
    }
  }
  gameArea.appendChild(grid);
  hintEl.innerHTML += ` <span class="tag">1-4 only</span>`;

  let latest=0;
  cleanupCurrent=()=>finishGame(latest);
}

// ==================================================
// 4) Memory Flip Advanced — 24 cards (12 pairs)
// ==================================================
function startMemoryAdv(){
  const emojis = ["🎂","🎁","🎉","💖","🌹","🍫","✨","😍","🎈","⭐","🍰","🥳"];
  const deck = shuffle([...emojis, ...emojis]); // 24
  const grid = document.createElement('div');
  grid.className='grid';
  grid.style.gridTemplateColumns='repeat(6, 1fr)';
  grid.style.maxWidth='680px'; grid.style.margin='0 auto';

  let first=null, lock=false, matched=0;

  deck.forEach((v,i)=>{
    const card = document.createElement('button');
    card.className='tile';
    card.textContent='?';
    card.style.fontSize='1.6rem';
    card.addEventListener('click', ()=>{
      if(lock || card.dataset.open) return;
      card.dataset.open=1; card.textContent=v;
      if(!first){ first=card; }
      else{
        if(first.textContent===card.textContent){
          matched++;
          first=null;
          const prog = matched / emojis.length;
          if(prog>=1) finishGame(1); else last = Math.max(last, prog);
        }else{
          lock=true;
          setTimeout(()=>{
            delete card.dataset.open; delete first.dataset.open;
            card.textContent='?'; first.textContent='?';
            first=null; lock=false;
          }, 500);
        }
      }
    });
    grid.appendChild(card);
  });
  gameArea.appendChild(grid);

  let last=0;
  cleanupCurrent=()=>finishGame(last);
}

// ==================================================
// 5) Math Speed Drill — stream of mixed ops
// ==================================================
function startMathDrill(){
  const target = 20; // full progress if 20 correct
  let correct=0, attempted=0;

  const wrap = document.createElement('div');
  wrap.className='center';
  wrap.style.flexDirection='column';
  const q = document.createElement('div'); q.style.fontSize='1.6rem'; q.style.margin='10px';
  const input = document.createElement('input'); input.type='number'; input.className='input';
  input.style.width='160px'; input.style.fontSize='1.2rem';
  const btn = document.createElement('button'); btn.textContent='Submit';

  wrap.append(q, input, btn);
  gameArea.appendChild(wrap);

  function newQ(){
    const a=randInt(2,12), b=randInt(2,12);
    const ops = ['+','-','×','÷'];
    const op = ops[randInt(0,ops.length-1)];
    let ans;
    if(op==='+') ans=a+b;
    else if(op==='-') ans=a-b;
    else if(op==='×') ans=a*b;
    else { // ÷ — ensure divisible
      let x = a*b; ans=a; q.dataset.divisor=b; q.dataset.dividend=x;
      q.textContent = `${x} ÷ ${b} = ?`; return ans;
    }
    q.textContent = `${a} ${op} ${b} = ?`;
    return ans;
  }
  let answer = newQ();

  btn.addEventListener('click', ()=>{
    attempted++;
    if(parseFloat(input.value)==answer) correct++;
    input.value='';
    answer = newQ();
    const prog = Math.min(1, correct/target);
    last = Math.max(last, prog);
    if(prog>=1) finishGame(1);
  });
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter') btn.click();
  });
  input.focus();

  let last=0;
  cleanupCurrent=()=>finishGame(last);
}

// ==================================================
// 6) Simon Says — growing sequence
// ==================================================
function startSimon(){
  const colors = ['#e74c3c','#2ecc71','#3498db','#f1c40f'];
  const pads = [];
  const padWrap = document.createElement('div');
  padWrap.style.display='grid'; padWrap.style.gridTemplateColumns='repeat(2, 140px)';
  padWrap.style.gap='14px'; padWrap.style.margin='20px auto'; padWrap.style.width='max-content';

  colors.forEach(c=>{
    const b=document.createElement('button');
    b.style.width='140px'; b.style.height='140px'; b.style.borderRadius='16px';
    b.style.border='3px solid #ffffff25'; b.style.background=c+'99';
    b.addEventListener('click',()=>playInput(b));
    pads.push(b); padWrap.appendChild(b);
  });
  gameArea.appendChild(padWrap);

  let seq=[]; let userIndex=0; let accepting=false; let best=0;

  function flash(b){ const old=b.style.filter; b.style.filter='brightness(1.8)';
    setTimeout(()=>b.style.filter=old,250);
  }
  function playSeq(i=0){
    accepting=false;
    if(i>=seq.length){ accepting=true; userIndex=0; return; }
    flash(pads[seq[i]]);
    setTimeout(()=>playSeq(i+1), 420);
  }
  function nextRound(){
    seq.push(randInt(0,3));
    playSeq();
  }
  function playInput(btn){
    if(!accepting) return;
    const idx=pads.indexOf(btn);
    if(idx===seq[userIndex]){ userIndex++; flash(btn);
      if(userIndex===seq.length){ best=Math.max(best, seq.length);
        const prog = Math.min(1, best/8); last=Math.max(last,prog);
        if(prog>=1) return finishGame(1);
        setTimeout(nextRound, 600);
      }
    }else{
      // mistake — lose current round, keep best partial
      accepting=false;
      setTimeout(nextRound, 800);
    }
  }
  nextRound();

  let last=0;
  cleanupCurrent=()=>finishGame(last);
}

// ==================================================
// 7) Typing Accuracy — progress by correct chars
// ==================================================
function startTyping(){
  const text = "Happiness is homemade. Type this quickly and accurately to score high.";
  const p = document.createElement('p'); p.className='small'; p.textContent=text;
  const ta = document.createElement('textarea');
  ta.rows=4; ta.className='input'; ta.style.width='100%';
  const meter = document.createElement('div'); meter.className='small'; meter.style.marginTop='8px';
  gameArea.append(p, ta, meter);
  ta.focus();

  function update(){
    const typed = ta.value;
    let correct=0;
    for(let i=0;i<Math.min(typed.length,text.length);i++){
      if(typed[i]===text[i]) correct++;
    }
    const prog = Math.min(1, correct/text.length);
    meter.textContent = `Correct chars: ${correct}/${text.length}`;
    last = Math.max(last, prog);
    if(prog>=1) finishGame(1);
  }
  ta.addEventListener('input', update);

  let last=0;
  cleanupCurrent=()=>finishGame(last);
}

// ==================================================
// 8) Snake Advanced — eat up to 10 apples
// ==================================================
function startSnake(){
  const COLS=20, ROWS=14, size=28;
  const canvas=document.createElement('canvas');
  canvas.width=COLS*size; canvas.height=ROWS*size; canvas.className='canvas-wrap';
  gameArea.appendChild(canvas);
  const ctx=canvas.getContext('2d');

  let snake=[{x:5,y:7}], dir={x:1,y:0}, apple=spawnApple(), speed=110, eaten=0, alive=true;
  let loopId=null;

  function spawnApple(){
    while(true){
      const a={x:randInt(0,COLS-1),y:randInt(0,ROWS-1)};
      if(!snake.some(s=>s.x===a.x&&s.y===a.y)) return a;
    }
  }
  function draw(){
    ctx.fillStyle='#0b0f1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // grid
    ctx.fillStyle='#11172b';
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++)
      ctx.fillRect(x*size+ (x%2?0:0), y*size+(y%2?0:0), size-1,size-1);
    // apple
    ctx.fillStyle='#e74c3c'; ctx.beginPath();
    ctx.arc(apple.x*size+size/2, apple.y*size+size/2, size*0.35, 0, Math.PI*2); ctx.fill();
    // snake
    ctx.fillStyle='#ffca28';
    snake.forEach((s,i)=>{ ctx.fillRect(s.x*size+2, s.y*size+2, size-4, size-4); });
  }
  function tick(){
    if(!alive) return;
    const head={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    if(head.x<0||head.y<0||head.x>=COLS||head.y>=ROWS || snake.some(s=>s.x===head.x&&s.y===head.y)){
      alive=false; finishGame(last); return;
    }
    snake.unshift(head);
    if(head.x===apple.x && head.y===apple.y){
      eaten++; apple=spawnApple();
      last=Math.max(last, Math.min(1, eaten/10));
      if(eaten>=10) return finishGame(1);
      if(speed>70){ clearInterval(loopId); speed-=5; loopId=setInterval(tick, speed); }
    } else snake.pop();
    draw();
  }
  draw();
  const key=(e)=>{
    if(e.key==='ArrowLeft' && dir.x!==1){ dir={x:-1,y:0}; }
    else if(e.key==='ArrowRight' && dir.x!==-1){ dir={x:1,y:0}; }
    else if(e.key==='ArrowUp' && dir.y!==1){ dir={x:0,y:-1}; }
    else if(e.key==='ArrowDown' && dir.y!==-1){ dir={x:0,y:1}; }
  };
  window.addEventListener('keydown', key);
  let last=0;
  cleanupCurrent=()=>{
    window.removeEventListener('keydown', key);
    clearInterval(loopId);
    finishGame(last);
  };
  loopId=setInterval(tick, speed);
}

// ==================================================
// 9) Sliding Puzzle 3×3 — progress by tiles correct
// ==================================================
function startSlidingPuzzle(){
  const N=3; // 3x3
  const board = [...Array(N*N).keys()]; // 0..8; 8 is blank
  // shuffle into solvable state
  do { shuffle(board); } while(!isSolvable(board));

  const grid=document.createElement('div');
  grid.className='grid'; grid.style.gridTemplateColumns=`repeat(${N}, 80px)`;
  grid.style.margin='0 auto'; grid.style.userSelect='none';

  function isSolvable(arr){
    const a=arr.filter(v=>v!==N*N-1);
    let inv=0;
    for(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++) if(a[i]>a[j]) inv++;
    return inv%2===0;
  }

  function render(){
    grid.innerHTML='';
    let correct=0;
    board.forEach((v,i)=>{
      const tile=document.createElement('div');
      tile.className='tile';
      if(v===N*N-1){ tile.textContent=''; tile.style.background='#0b0f1a'; tile.style.borderStyle='dashed'; }
      else { tile.textContent=String(v+1); if(v===i) { tile.style.background='#284a2a'; correct++; } }
      tile.addEventListener('click', ()=> move(i));
      grid.appendChild(tile);
    });
    const prog = correct/(N*N);
    last=Math.max(last, prog);
    if(correct===N*N) finishGame(1);
  }

  function move(i){
    const blank = board.indexOf(N*N-1);
    const bx=Math.floor(blank%N), by=Math.floor(blank/N);
    const ix=Math.floor(i%N), iy=Math.floor(i/N);
    if((Math.abs(bx-ix)+Math.abs(by-iy))===1){
      [board[i], board[blank]]=[board[blank], board[i]];
      render();
    }
  }

  render();
  gameArea.appendChild(grid);
  let last=0;
  cleanupCurrent=()=>finishGame(last);
}

// ==================================================
// 10) Reaction Duel — 5 rounds, map average ms to progress
// ==================================================
function startReactionDuel(){
  const wrap=document.createElement('div'); wrap.className='center'; wrap.style.flexDirection='column';
  const box=document.createElement('div');
  box.style.width='420px'; box.style.height='160px'; box.style.borderRadius='12px';
  box.style.background='#9b59b6'; box.className='center';
  box.style.fontSize='1.2rem'; box.style.fontWeight='700';
  box.textContent='Wait for GREEN...';
  box.style.userSelect='none';
  wrap.appendChild(box);
  gameArea.appendChild(wrap);

  let rounds=0, times=[];
  let waiting=true, greenAt=0;

  function nextRound(){
    waiting=true; box.style.background='#9b59b6'; box.textContent='Wait for GREEN...';
    setTimeout(()=>{ greenAt=performance.now(); waiting=false; box.style.background='#2ecc71'; box.textContent='NOW! Click!'; }, randInt(900,2200));
  }
  box.addEventListener('click', ()=>{
    if(waiting){ // clicked too early
      // small penalty: add 800ms
      times.push(800);
      rounds++;
    } else {
      const rt=performance.now()-greenAt;
      times.push(rt);
      rounds++;
    }
    if(rounds>=5){
      // map average to progress: 250ms = 100%, 600ms = 0%
      const avg = times.reduce((a,b)=>a+b,0)/times.length;
      const prog = Math.max(0, Math.min(1, (600-avg)/(600-250)));
      last=Math.max(last, prog);
      finishGame(prog);
    } else {
      nextRound();
    }
  });
  nextRound();

  let last=0;
  cleanupCurrent=()=>finishGame(last);
}
