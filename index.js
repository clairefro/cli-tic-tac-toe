const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// --- CONSTANTS ---
const X = "X";
const O = "O";
const EMPTY = "%";
const TIE = "TIE";

const BOARD_KEY_MAP = {
  e: 0,
  r: 1,
  t: 2,
  d: 3,
  f: 4,
  g: 5,
  c: 6,
  v: 7,
  b: 8,
};

const WINNING_COMBOS = [
  // HORIZONTAL
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // VERTICAL
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // DIAGONAL
  [0, 4, 8],
  [2, 4, 6],
];
// -----------------

const keymapStr = Object.keys(BOARD_KEY_MAP)
  .map((k) => k.toUpperCase())
  .join("");

function getKeyByValue(obj, val) {
  return Object.keys(obj).find((k) => obj[k] === val);
}

const map = buildBoard(keymapStr, "KEY MAP");

// --- GAME STATE ---
let moves = EMPTY.repeat(9); // default to empty board
let xsTurn = true;
const MODE = {
  SINGLE: "SINGLE",
  MULTI: "MULTI",
};
// default to single player
let mode = MODE.SINGLE;

// ------------------

/** draw a board from a string of 9 chars */
function buildBoard(moves, title) {
  if (moves.length !== 9) {
    throw new Error("Something went horribly wrong");
  }
  return `${title}\n${moves
    .match(/.{3}/g)
    .map((row) => `| ${row.split("").join(" | ")} |`)
    .join("\n-------------\n")
    // display empty spaces as spaces
    .replace(new RegExp(EMPTY, "g"), " ")}\n\n`;
}

function clearScreen() {
  // ESC<clear>ESC<set cursor 0,0>
  process.stdout.write("\x1B[2J\x1B[0f");
}

function drawMap() {
  process.stdout.write(map);
}

function replaceChar(str, i, r) {
  return str.slice(0, i) + r + str.slice(i + 1);
}

function isMarked(movesStr, i) {
  return movesStr[i] !== EMPTY;
}

function updateGameBoard() {
  const updatedBoard = buildBoard(moves, "GAME BOARD");
  process.stdout.write(updatedBoard);
  return updatedBoard;
}

function loopWithDelay() {
  setTimeout(() => loop(), 700);
}

/** returns undefined, or the winning player, or "TIE" if no winner and moves are exhausted */
function checkResult(moves) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (moves[a] === moves[b] && moves[b] === moves[c] && moves[a] !== EMPTY) {
      return moves[a];
    }
  }

  // CHECK FOR TIE (no empty && no wins)
  if (!moves.match(EMPTY)) return TIE;

  return;
}

function isValidChar(input) {
  return Object.keys(BOARD_KEY_MAP).includes(input.toLowerCase());
}

function displayBoard() {
  clearScreen();
  drawMap();
  updateGameBoard();
}

function predictWinningMove(player) {
  const currentMovesIndexes = [];
  for (let i = 0; i < moves.length; i++) {
    if (moves[i] === player) currentMovesIndexes.push(i);
  }
  let index;
  for (combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (moves[a] === player && moves[b] == player) {
      if (moves[c] !== EMPTY) return;
      index = c;
      break;
    } else if (moves[a] === player && moves[c] == player) {
      if (moves[b] !== EMPTY) return;
      index = b;
      break;
    } else if (moves[b] === player && moves[c] == player) {
      if (moves[a] !== EMPTY) return;
      index = a;
      break;
    }
  }

  return index ? getKeyByValue(BOARD_KEY_MAP, index) : undefined;
}

function randomMove() {
  let availIndices = [];
  for (let i = 0; i < moves.length; i++) {
    if (moves[i] === EMPTY) {
      availIndices.push(i);
    }
  }
  if (availIndices.length === 0) return;
  const index = availIndices[Math.floor(Math.random() * availIndices.length)];
  const move = getKeyByValue(BOARD_KEY_MAP, index);
  return move;
}

function getComputerMove(moves) {
  // P0 = block X, P1 = win O, otherwise random
  let move = predictWinningMove(X) || predictWinningMove(O) || randomMove();
  return move;
}

function handleTurn(input) {
  try {
    const inLower = input.toLowerCase();
    if (inLower === "exit") {
      console.log("Bye!");
      rl.close();
      return;
    }

    if (isValidChar(inLower)) {
      if (isMarked(moves, BOARD_KEY_MAP[inLower])) {
        throw new Error("You can't mark a used space!! Try another key");
      }
      moves = replaceChar(moves, BOARD_KEY_MAP[inLower], xsTurn ? X : O);

      displayBoard();

      const result = checkResult(moves);

      if (result === TIE) {
        console.log("TIE GAME! No winner.\n");
        rl.close();
        return;
      }
      if (result) {
        console.log(`\n${result} wins! Congrats.\n`);
        rl.close();
        return;
      }
      console.log(`\n${xsTurn ? X : O} entered: ${input}`);
      xsTurn = !xsTurn;
    } else {
      console.log(
        `Invalid input. Choose from: ${Object.keys(BOARD_KEY_MAP)
          .map((k) => k.toUpperCase())
          .join(", ")}`
      );
    }
  } catch (e) {
    console.log(e.message);
  }
  loopWithDelay();
}

function loop() {
  displayBoard();
  const turnMsg = `${xsTurn ? X : O}'s turn.`;

  if (mode == MODE.SINGLE && !xsTurn) {
    const input = getComputerMove(moves);
    setTimeout(() => handleTurn(input), 700);
  } else {
    console.log(
      `\n${turnMsg} Enter your move from the key map above (or 'exit' to quit):`
    );

    rl.question("> ", (input) => {
      handleTurn(input);
    });
  }
}

function init() {
  clearScreen();
  rl.question(
    "Select game mode:\n\n- 1. Single player (vs. computer)\n\n- 2. Multiplayer\n\n> ",
    (answer) => {
      if (answer.trim() === "1") {
        mode = MODE.SINGLE;
        console.log("\nSingle Player mode! You're X and computer is O.");
      } else if (answer.trim() === "2") {
        mode = MODE.MULTI;
        console.log("\nMultiplayer mode!");
      } else {
        console.log("\nInvalid mode selection. Defaulting to Single player.");
      }
      // delay start to show message
      loopWithDelay();
    }
  );
}

init();
