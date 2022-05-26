const terminal = $("#terminal__input");
const cursor = $("#cursor")[0];

let input = "";
let ctrlMod = false;
let ctrlCommand = [];

const resetCursor = resetCursorFactory();

const specialKeys = {
  Control: () => (ctrlMod = true),
  Backspace: () => (input = input.split("").slice(0, -1).join("")),
  Enter: () => sendInput(),
};

$(window).keydown(async (e) => {
  const { key } = e;
  if (specialKeys[key] && !ctrlMod) specialKeys[key]();
  else if (ctrlMod) await ctrlController(key);
  else if (isAlphaNumeric(key)) input += key;

  terminal.text() !== input && terminal.text(input);
});

$(window).keyup((e) => {
  const { key } = e;
  if (key === "Control") {
    ctrlMod = false;
    ctrlCommand = [];
  }
});

// check to see if user input char is allowed
function isAlphaNumeric(key) {
  resetCursor();
  const keys =
    'abcdefghijklmnopqrstuvwxyz1234567890 !@#$%^&*()_+"`~{}[]\\|:;<>,./?'.split(
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
  input = "";
}

async function ctrlController(key) {
  // Manage ctrl command keys START
  // If key isnt in current user command, run code
  if (!ctrlCommand.includes(key)) {
    // add key to command group
    ctrlCommand.push(key);
    // add a listener for that key using namespace to remove it latter
    $(window).on("keyup.ctrlController" + key, (e) => {
      // on key up, remove key from command group
      const keyIndex = ctrlCommand.findIndex((elm) => elm === key);
      ctrlCommand.splice(keyIndex, 1);
      // remove listener for key
      $(window).off(".ctrlController" + key);
    });
  }
  // Manage ctrl command keys END

  const command = ctrlCommand.join("");

  switch (command) {
    case "v":
      // TODO: fix possible exploit
      // ctrl V can be used to bypass isAlphanumeric check atm.
      input += await navigator.clipboard.readText();
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
