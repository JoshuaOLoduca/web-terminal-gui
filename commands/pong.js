class Pong {
  constructor() {
    this.leftPaddle;
    this.rightPaddle;
    this.ball;
    this._lastTick;
    this._exit = false;
    this.containerElement;
    this.collisionManager;

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

    this.collisionManager = new HtmlCollisionManager([
      this.leftPaddle,
      this.rightPaddle,
      this.ball,
    ]);

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
    const collisions = this.collisionManager.getCollisons();

    // console.log(collisions);

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
        [b.element.id]: [],
      };
    }, {});
  }

  getCollisons() {
    const collisions = this._collisionsObjectTemplate;
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
    this.test = this.#y;

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
    return this.$Elm.position().top;
  }

  set #x(newX) {
    this.$Elm.offset({ left: newX });
  }
  get #x() {
    return this.$Elm.position().left;
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
    this._pos.y = this._pos.y - delta * this.speed;
    document
      .getElementById(this.element.id)
      .style.setProperty("--y", this._pos.y + this.posSuffix);
  }
  #moveDown(delta) {
    this._pos.y = this._pos.y + delta * this.speed;
    document
      .getElementById(this.element.id)
      .style.setProperty("--y", this._pos.y + this.posSuffix);
  }
}
class PongPaddle extends PongElement {
  constructor(elm) {
    super(elm);

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
