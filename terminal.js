const terminal = $("#terminal__input");
const cursor = $("#cursor")[0];
const screen = $("#terminal__screen");
const calc = new Calculator();

let input = "";
let ctrlMod = false;
let ctrlCommand = [];
let disableInput = false;

const resetCursor = resetCursorFactory();

const commands = {
  calc: (input) => calc.calculate(input),
  help: () =>
    commandSummary.reduce(
      (prev, curr) => (prev += `${prev && "<br />"}${curr[0]}: ${curr[1]}`),
      ""
    ),
  pong: () =>
    renderFullscreenApp("pong", (...myArgs) => {
      const pong = new Pong();
      pong.render(...myArgs);
    }),
};

function renderFullscreenApp(appName, appRenderCb) {
  disableInput = true;
  $(document.body)
    .prepend(
      $.parseHTML(`<div id="${appName}_fullscreen" class="focused_screen" />`)
    )
    .ready(function () {
      appRenderCb($(`#${appName}_fullscreen`), () => (disableInput = false));
    });

  return `Launching ${appName}`;
}

const commandSummary = [
  [
    "calc",
    `CLI Calculator. supports + - / * ^ and ().
    <br/ >&nbsp; &nbsp; IE:
    <ul class='terminal__help__list'>
    <li>calc 2 * 3 / 1 + -1</li>
    <li>calc (22/2-2*5)^2+(4-6/6)^2</li>
    </ul>
    &nbsp; &nbsp; Prints proof to console`,
  ],
  ["help", "shows this menu"],
  ["pong", "play with some paddles"],
];

const specialKeys = {
  Control: () => (ctrlMod = true),
  Backspace: () => (input = input.split("").slice(0, -1).join("")),
  Enter: () => sendInput(),
};

function fireSpecialKey(key) {
  if (disableInput && key !== "Control") return;
  specialKeys[key]();
}

registerTerminalListeners();

function registerTerminalListeners() {
  $(window).keydown(async (e) => {
    resetCursor();
    const { key } = e;
    if (specialKeys[key] && !ctrlMod) fireSpecialKey(key);
    else if (ctrlMod) await ctrlController(key);
    else if (isAlphaNumeric(key) && !disableInput) input += key;

    terminal.text() !== input && terminal.text(input);
  });

  $(window).keyup((e) => {
    const { key } = e;
    if (key === "Control") {
      ctrlMod = false;
      ctrlCommand = [];
    }
  });
}

// check to see if user input char is allowed
function isAlphaNumeric(key) {
  const keys =
    'abcdefghijklmnopqrstuvwxyz1234567890 !@#$%^&*()_+"`~{}[]\\|:;<>,./?-'.split(
      ""
    );
  return keys.includes(key.toLowerCase());
}

// Using closures to reliable reset animation back to original
function resetCursorFactory() {
  let cursorAnimationTimeout;
  const animationName = cursor.style["animation-name"];

  return function resetCursor() {
    if (cursorAnimationTimeout) clearTimeout(cursorAnimationTimeout);
    cursor.style["animation-name"] = "none";
    cursorAnimationTimeout = setTimeout(() => {
      cursor.style["animation-name"] = animationName;
    }, 500);
  };
}

function sendInput() {
  const inputArr = input.split(" ");
  const prog = inputArr[0];
  const myArgs = inputArr.slice(1);
  writeToScreen(input);
  if (commands[prog]) writeToScreen(commands[prog](myArgs));
  else writeToScreen('Type "help" to list commands');
  input = "";
}

function writeToScreen(text) {
  writeToElement(screen, text);
  $(screen)[0].scrollTop = $(screen)[0].scrollHeight;
}

function writeToElement(elm, text) {
  $(elm).append(`<p>${text}</p>`);
}

async function ctrlController(key) {
  // Manage ctrl command keys START
  // If key isnt in current user command, run code
  if (!ctrlCommand.includes(key)) {
    // add key to command group
    ctrlCommand.push(key);
    // add a listener for that key using namespace to remove it latter
    $(window).on("keyup.ctrlController" + key.toLowerCase(), (e) => {
      // on key up, remove key from command group
      const keyIndex = ctrlCommand.findIndex((elm) => elm === key);
      ctrlCommand.splice(keyIndex, 1);
      // remove listener for key
      $(window).off(".ctrlController" + key.toLowerCase());
    });
  }
  // Manage ctrl command keys END

  const command = ctrlCommand.join("");

  switch (command) {
    case "v":
      if (disableInput) return;
      // TODO: fix possible exploit
      // ctrl V can be used to bypass isAlphanumeric check atm.
      input += await navigator.clipboard.readText();
      break;

    case "x":
      $(".focused_screen").remove();
      disableInput = false;
      break;

    case "y":
      console.log("test");
      break;

    case "Backspace":
      const inputArr = input.split(" ");
      // gets the first index of trailing whitespace from input
      const toRemove = (() => {
        let count = 0;
        for (let i = inputArr.length - 1; i >= 0; i--) {
          const elm = inputArr[i];
          if (elm === "") count--;
          else break;
        }
        return count;
      })();

      // remove trailing whitespace plus newest word
      input = inputArr.slice(0, toRemove - 1).join(" ");
      break;
  }
}
