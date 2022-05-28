class Calculator {
  constructor() {
    this._input = [];

    this.operators = {
      "+": this.add,
      "-": this.subtract,
      "/": this.divide,
      "*": this.multiply,
      "^": this.exponential,
      "(": true,
      ")": true,
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

    this._input = value.trim().split(/\s+/);
  }

  get input() {
    return this._input.join(" ");
  }

  result() {
    if (this._input.length === 1) return this._input[0];

    const stack = [];

    for (let i = 0; i < this._input.length; i++) {
      const char = this._input[i];
      if (char === "(") stack.push([i, char]);
      if (char !== ")") continue;

      console.log(stack, this._input);

      if (stack.length === 0) return "Missing Parenthesis";

      const start = stack.pop()[0];
      const sum = this.calculateArray(this._input.slice(start + 1, i));
      this._input.splice(start, i + 1, sum);
      i = start;
    }

    return this.calculateArray(this._input);
  }

  calculateArray(arr) {
    const pemdas = ["^", ["*", "/"], ["+", "-"]];
    let performOperator = false;
    for (const operator of pemdas) {
      for (let i = 0; i < arr.length; i++) {
        const char = arr[i];
        if (operator.includes(char)) {
          performOperator = char;
          continue;
        }
        if (!performOperator) continue;

        const num2 = Number(char);
        const num1 = Number(arr[i - 2]);
        // console.log(arr);

        arr[i - 1] = this.operators[performOperator](num1, num2);
        arr.splice(i, 1);
        arr.splice(i - 2, 1);
        i -= 2;
        // console.log(arr);

        performOperator = false;
      }
    }

    return arr[0];
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
