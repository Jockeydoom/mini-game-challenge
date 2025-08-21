let currentGame = 0;
let score = 0;
let timer;
let timeLeft = 60;

const games = [
  startBalloonGame,
  startMemoryGame,
  startCatchGame,
  startMathQuiz,
  startWordScramble,
  startReactionGame,
  startWhackMole,
  startSnakeGame,
  startPuzzleGame,
  startTypingGame
];

// Start Challenge
function startChallenge() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");
  nextGame();
}

// Next Game
function nextGame() {
  if (currentGame >= games.length) {
    endChallenge();
    return;
  }
  document.getElementById("gameNumber").textContent = currentGame + 1;
  document.getElementById("gameArea").innerHTML = "";
  timeLeft = 60;
  document.getElementById("timer").textContent = timeLeft;

  // Timer
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      finishGame(0); // time over, no marks
    }
  }, 1000);

  games[currentGame]();
}

// Finish Game (progress = 0 to 1)
function finishGame(progress) {
  clearInterval(timer);
  let marks = Math.round(progress * 10);
  score += marks;
  document.getElementById("score").textContent = score;
  currentGame++;
  setTimeout(nextGame, 1000); 
}

function endChallenge() {
  document.getElementById("hud").classList.add("hidden");
  document.getElementById("gameArea").innerHTML = "";
  document.getElementById("final").classList.remove("hidden");
  document.getElementById("finalScore").textContent = score;
}

function restart() {
  currentGame = 0;
  score = 0;
  document.getElementById("score").textContent = 0;
  document.getElementById("final").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
}

/* --------------------
   MINI GAMES
-------------------- */

// 1. Balloon Pop
function startBalloonGame() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>🎈 Pop Balloons!</h3>";
  let popped = 0;
  let total = 10;
  for (let i=0;i<total;i++) {
    let b = document.createElement("button");
    b.textContent = "🎈";
    b.style.fontSize = "2rem";
    b.onclick = () => {
      b.remove();
      popped++;
      if (popped === total) finishGame(1);
    };
    area.appendChild(b);
  }
}

// 2. Memory Flip (tiny 2 pairs)
function startMemoryGame() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>🧩 Match Pairs!</h3>";
  const emojis = ["🎂","🎂","🎁","🎁"];
  let shuffled = emojis.sort(() => 0.5 - Math.random());
  let first = null, matched = 0;
  shuffled.forEach(e => {
    let card = document.createElement("button");
    card.textContent = "?";
    card.onclick = () => {
      if (card.textContent !== "?") return;
      card.textContent = e;
      if (!first) {
        first = card;
      } else {
        if (first.textContent === card.textContent) {
          matched++;
          if (matched === 2) finishGame(1);
          first = null;
        } else {
          setTimeout(() => {
            first.textContent = "?";
            card.textContent = "?";
            first = null;
          }, 500);
        }
      }
    };
    area.appendChild(card);
  });
}

// 3. Catch Cakes
function startCatchGame() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>🎂 Catch Cakes! (click)</h3>";
  let caught = 0, total = 5;
  for (let i=0;i<total;i++) {
    let cake = document.createElement("button");
    cake.textContent = "🎂";
    cake.onclick = () => {
      cake.remove();
      caught++;
      if (caught === total) finishGame(1);
    };
    area.appendChild(cake);
  }
}

// 4. Math Quiz
function startMathQuiz() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>➕ Solve: 5 + 7 = ?</h3>";
  let input = document.createElement("input");
  input.type="number";
  area.appendChild(input);
  let btn = document.createElement("button");
  btn.textContent="Submit";
  btn.onclick = () => {
    if (parseInt(input.value)===12) finishGame(1);
    else finishGame(0.5);
  };
  area.appendChild(btn);
}

// 5. Word Scramble
function startWordScramble() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>🔤 Unscramble: TAC</h3>";
  let input = document.createElement("input");
  area.appendChild(input);
  let btn = document.createElement("button");
  btn.textContent="Check";
  btn.onclick = () => {
    if (input.value.toLowerCase()==="cat") finishGame(1);
    else finishGame(0.3);
  };
  area.appendChild(btn);
}

// 6. Reaction Game
function startReactionGame() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>⚡ Click when GREEN!</h3>";
  let box = document.createElement("div");
  box.style.width="100px"; box.style.height="100px"; 
  box.style.background="red"; box.style.margin="20px auto";
  area.appendChild(box);
  setTimeout(()=> {
    box.style.background="green";
    box.onclick = ()=> finishGame(1);
  }, 2000);
}

// 7. Whack-a-Mole
function startWhackMole() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>🐹 Whack the Mole!</h3>";
  let mole = document.createElement("button");
  mole.textContent="🐹";
  mole.onclick = () => finishGame(1);
  area.appendChild(mole);
}

// 8. Snake Lite (simplified)
function startSnakeGame() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>🐍 Snake: Eat Heart!</h3>";
  let btn = document.createElement("button");
  btn.textContent="💖 Eat";
  btn.onclick = ()=> finishGame(1);
  area.appendChild(btn);
}

// 9. Puzzle Game
function startPuzzleGame() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>🖼️ Puzzle: Complete</h3>";
  let btn = document.createElement("button");
  btn.textContent="Done";
  btn.onclick = ()=> finishGame(1);
  area.appendChild(btn);
}

// 10. Typing Game
function startTypingGame() {
  const area = document.getElementById("gameArea");
  area.innerHTML = "<h3>⌨️ Type: hello</h3>";
  let input = document.createElement("input");
  area.appendChild(input);
  let btn = document.createElement("button");
  btn.textContent="Check";
  btn.onclick = () => {
    if (input.value==="hello") finishGame(1);
    else finishGame(0.5);
  };
  area.appendChild(btn);
}
