const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const X = "X";
const O = "O";
const EMPTY = "%";
const TIE = "TIE";
let xsTurn = true;

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

const boardKeyMap = {
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

const keymap = Object.keys(boardKeyMap)
  .map((k) => k.toUpperCase())
  .join("");

const map = buildBoard(keymap, "KEY MAP");

/** default game board to empty board */
let moves = EMPTY.repeat(9);

function clearScreen() {
  // ESC<clear>ESC<set cursor 0,0>
  process.stdout.write("\x1B[2J\x1B[0f");
  process.stdout.write(map);
}

function replaceChar(str, i, r) {
  return str.slice(0, i) + r + str.slice(i + 1);
}

function isMarked(movesStr, i) {
  return movesStr[i] !== "%";
}

function updateGameBoard() {
  const updatedBoard = buildBoard(moves, "GAME BOARD");
  process.stdout.write(updatedBoard);
  return updatedBoard;
}

/** returns undefined, or the winning player, or "TIE" if no winner and moves are exhausted */
function checkResult(moves) {
  const winningCombos = [
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

  for (const combo of winningCombos) {
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
  return Object.keys(boardKeyMap).includes(input.toLowerCase());
}

function displayBoard() {
  clearScreen();
  updateGameBoard();
}

function loop() {
  displayBoard();
  const turnMsg = `${xsTurn ? X : O}'s turn.`;

  console.log(
    `\n\n${turnMsg} Enter your move from the key map above (or 'exit' to quit):`
  );

  rl.question("> ", (input) => {
    const inLower = input.toLowerCase();
    try {
      if (inLower === "exit") {
        console.log("Bye!");
        rl.close();
        return;
      }

      if (isValidChar(inLower)) {
        if (isMarked(moves, boardKeyMap[inLower])) {
          throw new Error("You can't mark a used space!! Try another key");
        }
        moves = replaceChar(moves, boardKeyMap[inLower], xsTurn ? X : O);

        displayBoard();

        const result = checkResult(moves);

        if (result === TIE) {
          console.log("TIE GAME! No winner.");
          rl.close();
          return;
        }
        if (result) {
          console.log(`\n\n${result} wins! Congrats.`);
          rl.close();
          return;
        }
        console.log(`\n\n${xsTurn ? X : O} entered: ${input}`);
        xsTurn = !xsTurn;
      } else {
        console.log("Invalid input. Choose from: E, R, T / D, F, G / C, V, B");
      }
    } catch (e) {
      console.log(e.message);
    }

    setTimeout(loop, 800);
  });
}

function init() {
  // ask for game mode
  // start game loop with mode as arg
  rl.question;
}

loop();
