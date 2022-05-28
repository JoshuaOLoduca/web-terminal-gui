class Calculator {
  constructor() {
    this.input = "";
    this._input = [];
    this.result;

    this.operators = {
      "+": this.add,
      "-": this.subtract,
      "/": this.divide,
      "*": this.multiply,
    };
  }

  set input(value) {
    if (Array.isArray(value)) value = value.join(" ");

    // remove all whitespace
    value = value.replace("/ /g", "");

    // Add back whitespace to each side of operators
    for (const operator in this.operators) {
      value = value.replaceAll(`${operator}`, ` ${operator} `);
    }

    this._input = value.split(" ");
  }

  get input() {
    return this._input.join(" ");
  }

  get result() {
    return this._input;
  }

  add(num1, num2) {
    num1 + num2;
  }

  subtract(num1, num2) {
    num1 - num2;
  }

  divide(num1, num2) {
    num1 / num2;
  }

  multiply(num1, num2) {
    num1 * num2;
  }
}
