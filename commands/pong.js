class Pong {
  constructor() {
    this.leftPaddle;
    this.rightPaddle;
    this.ball;
    this._lastTick;
    this._exit = false;
    this.containerElement;

    this.playerOneController;

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
          <div class='pong__paddle' id='pong__left'> </div>
          <div id='pong__ball'> </div>
          <div class='pong__paddle' id='pong__right'> </div>
        </div>
        <button id="pong_remove">exit</button>
      </div>
      `
    );
    $("#pong_remove").on("click", () => {
      cleanupCb();
      $(element).remove();
      this._exit = true;
    });

    this.initialize();
  }

  initialize() {
    this.leftPaddle = new PongPaddle(document.getElementById("pong__left"));

    this.rightPaddle = new PongPaddle(document.getElementById("pong__right"));
    console.log(this);

    this.ball = new PongBall(document.getElementById("pong__ball"));

    this.playerOneController = new PongPaddleController(this.leftPaddle);

    // register player controller
    this.cleanupCbs.push(
      new PlayerInputController("itsamee", {
        w: () => this.playerOneController.movePaddleUp(),
        s: () => this.playerOneController.movePaddleDown(),
      })
    );

    window.requestAnimationFrame((time) => {
      if (!this.lastTick) this.lastTick = time;
      this.tick(time - this.lastTick);
      this.lastTick = time;
    });
  }

  tick(delta) {
    if (this._exit || $("#" + this.containerElement[0].id).length === 0) {
      this._exit = false;
      this.cleanupCbs.forEach((cb) => cb());
      return;
    }
    this.playerOneController.movePaddle(delta);

    window.requestAnimationFrame((time) => {
      this.tick(time - this.lastTick);
      this.lastTick = time;
    });
  }
}

class HtmlElement {
  constructor(element) {
    this._element = element;
    this._$Elm = $(element);
    this.Cords = {
      y: this.#y,
      x: this.#x,
    };
    this.size = {
      width: this.#width,
      height: this.#height,
    };

    console.log(this);
  }

  set #width(newWidth) {
    this._$Elm.outerWidth(newWidth);
  }
  get #width() {
    return this._$Elm.outerWidth();
  }

  set #height(newHeight) {
    this._$Elm.outerHeight(newHeight);
  }
  get #height() {
    return this._$Elm.outerHeight();
  }

  set #y(newY) {
    return this._$Elm.offset({ top: newY });
  }
  get #y() {
    return this._$Elm.position().left;
  }

  set #x(newX) {
    return this._$Elm.offset({ left: newX });
  }
  get #x() {
    return this._$Elm.position().top;
  }
}

class PongElement extends HtmlElement {
  constructor(element, speed = 1) {
    super(element);
    this._pos = {
      ...this._pos,
      y: window
        .getComputedStyle(document.getElementById(element.id))
        .getPropertyValue("--y"),
    };
    this.speed = speed;
  }
}
class PongPaddle extends PongElement {
  constructor(elm, speed = 1) {
    super(elm, speed);
    this.move = {
      up: (...theArgs) => this.#moveUp(...theArgs),
      down: (...theArgs) => this.#moveDown(...theArgs),
    };

    console.log(this);
  }

  #moveUp(delta) {
    console.log(delta, "up");
  }
  #moveDown(delta) {
    console.log(delta, "down");
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

  movePaddle(delta) {
    if (this.moveDirection === "up") this._paddle.move.up(delta);
    if (this.moveDirection === "down") this._paddle.move.down(delta);
    this.moveDirection = "";
  }
}

class PongBall extends PongElement {
  constructor(element, speed) {
    super(element, speed);
    this._pos = {
      ...this._pos,
      x: window
        .getComputedStyle(document.getElementById(element.id))
        .getPropertyValue("--x"),
    };
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
    }
  ) {
    this.player = playerName;
    this.controlsCbs = controlsObj;

    this.nameSpace = "PlayerInputController" + playerName;
    this.registerListener();

    return () => this.cleanup();
  }

  registerListener() {
    console.log("hi");
    $(window).on("keydown." + this.nameSpace, async (e) => {
      const { key } = e;
      if (this.controlsCbs[key]) this.controlsCbs?.[key]();
    });
  }

  cleanup() {
    console.log("cleaning up", this.player, "paddle controls");
    $(window).off("." + this.nameSpace);
  }
}
