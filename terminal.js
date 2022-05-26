const terminal = $("#terminal__input");

let input = "";

function isAlphaNumeric(key) {
  const keys = "abcdefghijklmnopqrstuvwxyz1234567890 ".split("");
  return keys.includes(key.toLowerCase());
}

$(window).keydown((e) => {
  const { key } = e;
  console.log(e);
  if (key === "Backspace") input = input.split("").slice(0, -1).join("");
  else if (isAlphaNumeric(key)) input += key;
  terminal.text(input);
});
