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

    // set all negative symbols for numbers to be directly beside their number
    // If a minus is after an operator, we will assume it negates the number to its right.

    // Create regex and replace string for all operators that are followed by -
    const regexForNegatives = [];
    Object.keys(this.operators).forEach((operator) => {
      // Double space because of the regex that adds whitespace
      regexForNegatives.push([
        new RegExp(`\\${operator}  \\- `, "g"),
        `${operator} -`,
      ]);
    });

    // Execute each regex on value string
    regexForNegatives.forEach((regElm) => {
      value = value.replace(regElm[0], regElm[1]);
    });

    // Trim and split value by space
    value = value.trim().split(/\s+/);

    // If the first index elm is a minus, combine it with the element on its right.
    if (isNaN(Number(value[0])) && value[0] === "-")
      value.splice(0, 2, value[0] + value[1]);

    this._input = value;
  }

  get input() {
    return this._input.join(" ");
  }

  result() {
    // If the input is length of 1, we already calculated the result. so return it
    if (this._input.length === 1) return this._input[0];

    // FILO Stack data structure to keep track of parenthesis
    const stack = [];

    for (let i = 0; i < this._input.length; i++) {
      const char = this._input[i];
      // If its an opening parenthesis, push its index to stack
      if (char === "(") stack.push([i, char]);
      // if the char isnt a closing parenthesis, skip this loop
      if (char !== ")") continue;

      // If we found a closing parenthesis and there are no opening parenthesis in the stack, return error message
      if (stack.length === 0) return "Missing Parenthesis";

      // Show Array before Mutation
      console.log(this._input);

      // Get index of opening parenthesis
      // (i is index of closing parenthesis)
      // and remove it from the stack
      const start = stack.pop()[0];

      // Slice the elements between parenthesis and calculate it VIA PEMDAS
      const sum = this.calculateArray(this._input.slice(start + 1, i));

      // Remove parenthesis group and add in the sum of its contents
      this._input.splice(start, i - start + 1, sum);

      // Move i back to where parenthesis group started
      i = start;

      // Show Array After Mutation
      console.log(this._input);
    }

    // If there are opening parenthesis in the stack, return error
    if (stack.length !== 0) return "Missing Parenthesis";

    // return the calculated once we resolved all parenthesis
    return this.calculateArray(this._input);
  }

  calculateArray(arr) {
    // Pemdas without the parenthesis
    // Exponents, multiplecation AND devision, addition AND subtraction
    const emdas = ["^", ["*", "/"], ["+", "-"]];

    // Keep track on if we are performing an operation
    let performOperator = false;

    // Loop through emdas in proper order
    for (const operator of emdas) {
      // Using traditional for loop because we will be resetting i manually since we need to loop left to right
      for (let i = 0; i < arr.length; i++) {
        const char = arr[i];
        // if char is an operator, perform that operation on the next number
        if (operator.includes(char)) {
          performOperator = char;
          continue;
        }
        // If we found a number, but havent found the operation to perform on it, skip loop.
        if (!performOperator) continue;

        // Show Array before Mutation
        console.log(arr);

        const num1 = Number(arr[i - 2]);
        const num2 = Number(char);

        // set index where operator is to sum of its neighbouring numbers
        arr[i - 1] = this.operators[performOperator](num1, num2);

        // remove right neighbour
        arr.splice(i, 1);
        // remove left neighbour
        arr.splice(i - 2, 1);

        // Move i back 2 steps since we deleted 2 neighbours
        i -= 2;

        // reset operator tracker
        performOperator = false;

        // Show Array After Mutation
        console.log(arr);
      }
    }

    // return the final sum of arr
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
