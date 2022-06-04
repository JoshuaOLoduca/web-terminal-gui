class Pong {
  constructor(player1Name = "human", player2Name = "ai") {
    this.leftPaddle;
    this.rightPaddle;
    this.ball;
    this._lastTick;
    this._exit = false;
    this.pause = false;
    this.containerElement;
    this.collisionManager;
    this.scoreManager;

    this.playerOneName = player1Name;
    this.playerTwoName = player2Name;

    this.playerOneController;
    this.playerTwoController;

    this.cleanupCbs = [];
  }

  render(element, cleanupCb) {
    this.containerElement = element;
    $(element).html(
      `
      <div id='pong__container'>
        <div id='pong__table'>
          <div id='pong__scoreboard'>
            <div id='pong__scoreboard__left'>0</div>
            <div id='pong__scoreboard__right'>0</div>
          </div>
          <div id='pong__net'> </div>
          <div class='pong__paddle' id='pong__left'> </div>
          <div id='pong__ball'> </div>
          <div class='pong__paddle' id='pong__right'> </div>
        </div>
        <button id="pong__remove">exit</button>
        <button id="pong__pause">pause</button>
      </div>
      `
    );
    $("#pong__remove").on("click", () => {
      cleanupCb();
      $(element).remove();
      this._exit = true;
    });
    $("#pong__pause").on("click", () => (this.pause = !this.pause));

    this.initialize();
  }

  initialize() {
    this.leftPaddle = new PongPaddle(document.getElementById("pong__left"));
    this.rightPaddle = new PongPaddle(document.getElementById("pong__right"));
    this.ball = new PongBall(document.getElementById("pong__ball"));

    this.playerOneController = new PongPaddleController(this.leftPaddle);
    this.playerTwoController = new PongPaddleAIInputController(
      this.rightPaddle,
      this.ball
    );

    this.scoreManager = new PongScoreboard([
      [
        this.playerOneName,
        new HtmlElement(document.getElementById("pong__scoreboard__left")),
      ],
      [
        this.playerTwoName,
        new HtmlElement(document.getElementById("pong__scoreboard__right")),
      ],
    ]);

    this.collisionManager = new HtmlCollisionManager([
      this.leftPaddle,
      this.rightPaddle,
      this.ball,
    ]);

    // register player controller
    this.cleanupCbs.push(
      new PlayerInputController(this.playerOneName, {
        w: () => this.playerOneController.movePaddleUp(),
        s: () => this.playerOneController.movePaddleDown(),
        clear: () => this.playerOneController.clearInput(),
        getCurrentInput: () => this.playerOneController.getInput(),
      })
    );

    console.log(this);
    window.requestAnimationFrame((time) => {
      if (!this.lastTick) this.lastTick = time;
      this.tick(time - this.lastTick);
      this.lastTick = time;
    });
  }

  tick(delta) {
    const {
      ball,
      leftPaddle,
      rightPaddle,
      playerOneController,
      playerTwoController,
      collisionManager,
      containerElement,
      cleanupCbs,
    } = this;

    // Exit Cleanup Code
    if (this._exit || $("#" + containerElement[0].id).length === 0) {
      this._exit = false;
      cleanupCbs.forEach((cb) => cb());
      return;
    }

    if (this.pause)
      return setTimeout(() => {
        window.requestAnimationFrame((time) => {
          this.tick(0);
          this.lastTick = time;
        });
      }, 5);

    // Move Pong Elements on Tick
    playerOneController.movePaddle(delta);
    playerTwoController.movePaddle(delta);
    ball.tickMove(delta);

    const collisions = collisionManager.getCollisons();

    // Ball Collision Management
    if (collisions[ball].length > 0) {
      let newX;
      if (collisions[ball].includes(leftPaddle)) {
        newX =
          ((leftPaddle.cords().x +
            leftPaddle.size().width +
            ball.size().width / 2) /
            window.innerWidth) *
          100;
      } else {
        newX =
          ((rightPaddle.cords().x - ball.size().width / 2) /
            window.innerWidth) *
          100;
      }

      ball.bounce.sides();
      ball.setPos(newX);
      ball.increaseSpeed();
    }

    // bounce ball to inbounds when vertically out of bounds
    if (
      (ball._pos.y >=
        100 - (ball.size().height / 2 / window.innerHeight) * 100 &&
        ball.direction.y === ball.getDirectionEnums().y.down) ||
      (ball._pos.y <= 0 + (ball.size().height / 2 / window.innerHeight) * 100 &&
        ball.direction.y === ball.getDirectionEnums().y.up)
    )
      ball.bounce.top();

    // Score Management
    if (ball._pos.x >= 100 || ball._pos.x <= 0) {
      if (ball._pos.x >= 100)
        this.scoreManager.increaseScore(this.playerOneName);
      else this.scoreManager.increaseScore(this.playerTwoName);
      ball.reset(50, ball._pos.y);
    }

    window.requestAnimationFrame((time) => {
      this.tick(time - this.lastTick);
      this.lastTick = time;
    });
  }
}

class HtmlCollisionManager {
  constructor(elementList) {
    this.elements = elementList;
    this._collisionsObjectTemplate = this.elements.reduce((a, b) => {
      return {
        ...a,
        [b]: [],
      };
    }, {});
  }

  getCollisons() {
    const collisions = this.#getCollisionsObjectTemplate();
    for (let i = 0; i < this.elements.length; i++) {
      const element1 = this.elements[i];
      for (let j = i + 1; j < this.elements.length; j++) {
        const element2 = this.elements[j];

        if (this.#checkCollision(element1, element2)) {
          collisions[element1].push(element2);
          collisions[element2].push(element1);
        }
      }
    }

    return collisions;
  }

  #getCollisionsObjectTemplate() {
    return JSON.parse(JSON.stringify(this._collisionsObjectTemplate));
  }

  #checkCollision(element1, element2) {
    return (
      element1.cords().x < element2.cords().x + element2.size().width &&
      element1.cords().x + element1.size().width > element2.cords().x &&
      element1.cords().y < element2.cords().y + element2.size().height &&
      element1.size().height + element1.cords().y > element2.cords().y
    );
  }
}

class HtmlElement {
  constructor(element) {
    this.element = element;
    this.$Elm = $(element);
    this.cords = () => {
      return {
        y: this.#y,
        x: this.#x,
      };
    };
    this.size = () => {
      return { width: this.#width, height: this.#height };
    };

    console.log(this);
  }

  set #width(newWidth) {
    this.$Elm.outerWidth(newWidth);
  }
  get #width() {
    return this.$Elm.outerWidth();
  }

  set #height(newHeight) {
    this.$Elm.outerHeight(newHeight);
  }
  get #height() {
    return this.$Elm.outerHeight();
  }

  set #y(newY) {
    this.$Elm.offset({ top: newY });
  }
  get #y() {
    return this.$Elm.offset().top;
  }

  set #x(newX) {
    this.$Elm.offset({ left: newX });
  }
  get #x() {
    return this.$Elm.offset().left;
  }
}

class PongElement extends HtmlElement {
  constructor(element, speed = 0.1) {
    super(element);
    this.posSuffix = window
      .getComputedStyle(document.getElementById(element.id))
      .getPropertyValue("--y")
      .replace(/\s+|\b([0-9]|[1-9][0-9]|100)\b/g, "");
    this._pos = {
      ...this._pos,
      y: Number(
        window
          .getComputedStyle(document.getElementById(this.element.id))
          .getPropertyValue("--y")
          .replace(/\D+/g, "")
      ),
    };
    this.speed = speed;
    this.move = {
      up: (...theArgs) => this.#moveUp(...theArgs),
      down: (...theArgs) => this.#moveDown(...theArgs),
    };
  }

  #moveUp(delta) {
    if (
      this._pos.y +
        delta * this.speed -
        (this.size().height / 2 / window.innerHeight) * 100 <=
      0
    )
      return;
    this._pos.y = this._pos.y - delta * this.speed;
    this.setPosOnAxis(this._pos.y, "y");
  }
  #moveDown(delta) {
    if (
      this._pos.y -
        delta * this.speed +
        (this.size().height / 2 / window.innerHeight) * 100 >=
      100
    )
      return;
    this._pos.y = this._pos.y + delta * this.speed;
    this.setPosOnAxis(this._pos.y, "y");
  }

  setPosOnAxis(posNum, posAxis) {
    const smoothingSteps = 100;
    const currentPos = Number(
      window
        .getComputedStyle(document.getElementById(this.element.id))
        .getPropertyValue("--" + posAxis)
        .replace(/[^\d.]/g, "")
    );
    const delta =
      (currentPos > posNum ? currentPos - posNum : posNum - currentPos) /
      smoothingSteps;
    // console.log(delta);

    for (let i = 0; i < smoothingSteps; i++) {
      document
        .getElementById(this.element.id)
        .style.setProperty(
          "--" + posAxis,
          (posNum > currentPos
            ? currentPos + delta * i
            : currentPos - delta * i) + this.posSuffix
        );
      // console.log("smooth");
    }
  }
}

class PongPaddle extends PongElement {
  constructor(elm, speed) {
    super(elm, speed);

    console.log(this);
  }
}

class PongPaddleController {
  constructor(paddle) {
    this._paddle = paddle;
    this.moveDirection = "";
  }

  movePaddleUp() {
    this.moveDirection = "up";
  }

  movePaddleDown() {
    this.moveDirection = "down";
  }

  clearInput() {
    this.moveDirection = "";
  }

  movePaddle(delta) {
    if (this.moveDirection === "up") this._paddle.move.up(delta);
    if (this.moveDirection === "down") this._paddle.move.down(delta);
  }
}

class PongBall extends PongElement {
  constructor(element, speed = 0.025) {
    super(element, speed);
    this.baseSpeed = speed;
    this.speed = speed;
    this._pos = {
      ...this._pos,
      x: Number(
        window
          .getComputedStyle(document.getElementById(element.id))
          .getPropertyValue("--x")
          .replace(/\D+/g, "")
      ),
    };

    this.move = {
      ...this.move,
      left: (...theArgs) => this.#moveLeft(...theArgs),
      right: (...theArgs) => this.#moveRight(...theArgs),
    };

    this.bounce = {
      top: (...theArgs) => this.#bounceTop(...theArgs),
      sides: (...theArgs) => this.#bounceSide(...theArgs),
    };

    this.direction = {
      x:
        Math.random() <= 0.5 ? this.#DIRECTION.x.left : this.#DIRECTION.x.right,
      y: Math.random() <= 0.5 ? this.#DIRECTION.y.up : this.#DIRECTION.y.down,
    };
  }

  #DIRECTION = {
    x: { left: 1, right: 0 },
    y: { up: 1, down: 0 },
  };

  getDirectionEnums() {
    return this.#DIRECTION;
  }

  tickMove(delta) {
    if (this.direction.y === this.#DIRECTION.y.up) this.move.up(delta);
    else this.move.down(delta);

    if (this.direction.x === this.#DIRECTION.x.left) this.move.left(delta);
    else this.move.right(delta);
  }

  increaseSpeed(increase = this.baseSpeed / 4) {
    this.speed += increase;
  }

  #bounceTop() {
    this.direction.y =
      this.direction.y === this.#DIRECTION.y.up
        ? this.#DIRECTION.y.down
        : this.#DIRECTION.y.up;
  }

  #bounceSide() {
    this.direction.x =
      this.direction.x === this.#DIRECTION.x.left
        ? this.#DIRECTION.x.right
        : this.#DIRECTION.x.left;
  }

  setPos(newX = this._pos.x, newY = this._pos.y) {
    this._pos.x = newX;
    this._pos.y = newY;
    this.setPosOnAxis(this._pos.x, "x");
    this.setPosOnAxis(this._pos.y, "y");
  }

  reset(newX = 50, newY = 50) {
    this.setPos(newX, newY);
    this.speed = this.baseSpeed;
    if (Math.random() >= 0.5) this.bounce.top();
    if (Math.random() >= 0.5) this.bounce.sides();
  }

  #moveLeft(delta) {
    this._pos.x = this._pos.x - delta * this.speed;
    this.setPosOnAxis(this._pos.x, "x");
  }
  #moveRight(delta) {
    this._pos.x = this._pos.x + delta * this.speed;
    this.setPosOnAxis(this._pos.x, "x");
  }
}

class PlayerInputController {
  constructor(
    playerName,
    controlsObj = {
      w: () => {
        console.log(this.player, "w");
      },
      s: () => {
        console.log(this.player, "s");
      },
      a: () => {
        console.log(this.player, "a");
      },
      d: () => {
        console.log(this.player, "d");
      },
      clear: () => {
        console.log(this.player, "clearInput");
      },
    }
  ) {
    this.player = playerName;
    this.controlsCbs = controlsObj;

    this.keysDown = {};

    this.nameSpace = "PlayerInputController" + playerName;
    this.registerListener();

    return () => this.cleanup();
  }

  registerListener() {
    console.log("Register Input Listener for ", this.player);
    $(window).on("keydown." + this.nameSpace, async (e) => {
      const { key } = e;
      if (!this.controlsCbs[key]) return;

      this.controlsCbs?.[key]();
      this.keysDown[key] = true;
    });
    $(window).on("keyup." + this.nameSpace, async (e) => {
      const { key } = e;
      if (!this.keysDown[key]) return;

      this.controlsCbs?.clear();
      delete this.keysDown[key];
    });
  }

  cleanup() {
    console.log("cleaning up", this.player, "paddle controls");
    $(window).off("." + this.nameSpace);
  }
}

class PongPaddleAIInputController {
  constructor(paddle, ball, deadzone) {
    this.paddle = paddle;
    this.ball = ball;
    this.deadzone = deadzone || this.ball.size().height;
  }

  movePaddle(delta) {
    const middleOfPaddle =
      this.paddle.cords().y + this.paddle.size().height / 2;
    const middleOfBall = this.ball.cords().y + this.ball.size().height / 2;

    if (middleOfPaddle > middleOfBall + this.deadzone)
      this.paddle.move.up(delta);
    else if (middleOfPaddle < middleOfBall - this.deadzone)
      this.paddle.move.down(delta);
  }
}

class PongScoreboard {
  // playersWithScoreboard = [[player1, player1ScoreBoardElement]]
  constructor(playersWithScoreboard) {
    for (const playerBoard of playersWithScoreboard) {
      const [playerName, scoreBoardElm] = playerBoard;

      this[playerName] = scoreBoardElm;
    }
  }

  increaseScore(player, points = 1) {
    console.log(this[player], this);
    this[player].element.innerHTML =
      Number(this[player].element.innerHTML) + points;
  }
}
