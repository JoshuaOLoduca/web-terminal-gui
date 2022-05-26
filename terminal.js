const terminal = $("#terminal__input");

let input = "";
let ctrlMod = false;
let ctrlCommand = [];

const specialKeys = {
  Control: () => (ctrlMod = true),
  Backspace: () => (input = input.split("").slice(0, -1).join("")),
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

function isAlphaNumeric(key) {
  const keys = "abcdefghijklmnopqrstuvwxyz1234567890 ".split("");
  return keys.includes(key.toLowerCase());
}

async function ctrlController(key) {
  key = key.toLowerCase();

  // Manage ctrl command keys START
  if (!ctrlCommand.includes(key)) {
    ctrlCommand.push(key);
    $(window).on("keyup.ctrlController" + key, (e) => {
      const keyIndex = ctrlCommand.findIndex((elm) => elm === key);
      ctrlCommand.splice(keyIndex, 1);
      $(window).off(".ctrlController" + key);
    });
  }
  // Manage ctrl command keys END

  const command = ctrlCommand.join("");

  if (command === "v") {
    input += await navigator.clipboard.readText();
  } else if (command === "backspace") {
    const inputArr = input.split(" ");
    console.log(input.split(" ").slice(0, -1));
    input = (
      inputArr[inputArr.length - 1] === ""
        ? inputArr.slice(0, -2)
        : inputArr.slice(0, -1)
    ).join(" ");
  }
}
