class Calculator {
  constructor() {
    this._input = [];

    this.operators = {
      "+": this.add,
      "-": this.subtract,
      "/": this.divide,
      "*": this.multiply,
      "^": this.exponential,
    };
  }

  set input(value) {
    if (Array.isArray(value)) value = value.join(" ");

    // remove all whitespace
    value = value.replace(/\s+/g, "");

    // Add back whitespace to each side of operators
    for (const operator in this.operators) {
      const regex = new RegExp(`\\${operator}`, "g");
      value = value.replace(regex, ` ${operator} `);
    }

    this._input = value.split(/\s+/);
  }

  get input() {
    return this._input.join(" ");
  }

  result() {
    if (this._input.length === 1) return this._input[0];
    const pemdas = ["^", ["*", "/"], ["+", "-"]];
    let performOperator = false;
    for (const operator of pemdas) {
      for (let i = 0; i < this._input.length; i++) {
        const char = this._input[i];
        if (operator.includes(char)) {
          performOperator = char;
          continue;
        }
        if (!performOperator) continue;

        const num2 = Number(char);
        const num1 = Number(this._input[i - 2]);
        console.log(this._input);

        this._input[i - 1] = this.operators[performOperator](num1, num2);
        this._input.splice(i, 1);
        this._input.splice(i - 2, 1);
        i -= 2;
        console.log(this._input);

        performOperator = false;
      }
    }
    return this._input[0];
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

  exponential(num1, num2) {
    return Math.pow(num1, num2);
  }
}
