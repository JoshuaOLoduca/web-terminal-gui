class Calculator {
  constructor() {
    this.input = "";
    this._input = [];

    this.operators = {
      "+": this.add,
      "-": this.subtract,
      "/": this.divide,
      "*": this.multiply,
    };
  }

  set input(value) {
    console.log(value);
    if (Array.isArray(value)) value = value.join(" ");
    console.log(value);

    // remove all whitespace
    value = value.replace(/\s+/g, "");

    // Add back whitespace to each side of operators
    for (const operator in this.operators) {
      const regex = new RegExp(`\\${operator}`, "g");
      value = value.replace(regex, ` ${operator} `);
    }

    this._input = value.split(/\s+/);
    console.log(this._input);
  }

  get input() {
    return this._input.join(" ");
  }

  result() {
    const pemdas = ["*", "/", "+", "-"];
    let performOperator = false;
    for (const operator of pemdas) {
      for (let i = this._input.length - 1; i >= 0; i--) {
        const char = this._input[i];
        if (char === operator) {
          performOperator = true;
          continue;
        }
        if (!performOperator) continue;

        const num1 = Number(char);
        const num2 = Number(this._input[i + 2]);

        this._input[i + 1] = this.operators[operator](num1, num2);
        this._input.splice(i + 2, 1);
        this._input.splice(i, 1);

        performOperator = false;
      }
    }
    return this._input;
  }

  calculate(value) {
    this.input = value;
    return this.result();
  }

  add(num1, num2) {
    return num1 + num2;
  }

  subtract(num1, num2) {
    return num1 - num2;
  }

  divide(num1, num2) {
    return num1 / num2;
  }

  multiply(num1, num2) {
    return num1 * num2;
  }
}
