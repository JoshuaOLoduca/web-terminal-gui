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
  terminal.text(input);
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
  if (!ctrlCommand.includes(key)) ctrlCommand.push(key);

  if (ctrlCommand.includes("v")) {
    input += await navigator.clipboard.readText();
  } else if (ctrlCommand.includes("backspace")) {
    const inputArr = input.split(" ");
    console.log(input.split(" ").slice(0, -1));
    input = (
      inputArr[inputArr.length - 1] === ""
        ? inputArr.slice(0, -2)
        : inputArr.slice(0, -1)
    ).join(" ");
    console.log(input, "ctrl backspace");
  }
}
