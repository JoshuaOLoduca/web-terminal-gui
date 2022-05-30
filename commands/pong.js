class Pong {
  constructor() {
    this.leftPaddle;
    this.rightPaddle;
    this._lastTick = 0;
    this._exit = false;
    this.containerElement;

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
    this.leftPaddle = new PongPaddle(
      {
        y: window
          .getComputedStyle(document.getElementById("pong__left"))
          .getPropertyValue("--y"),
      },
      document.getElementById("pong__left")
    );

    this.rightPaddle = new PongPaddle(
      {
        y: window
          .getComputedStyle(document.getElementById("pong__right"))
          .getPropertyValue("--y"),
      },
      document.getElementById("pong__right")
    );
    console.log(this);

    // register player controller
    this.cleanupCbs.push(
      new PlayerInputController("itsamee", {
        w: () => this.leftPaddle.move.up("hiitme"),
        s: () => this.leftPaddle.move.down("hiitme"),
      })
    );

    this.tick(0);
  }

  tick(delta) {
    if (this._exit || $("#" + this.containerElement[0].id).length === 0) {
      this._exit = false;
      this.cleanupCbs.forEach((cb) => cb());
      return;
    }

    window.requestAnimationFrame((time) => {
      this.tick(time - this.lastTick);
      this.lastTick = time;
    });
  }
}

class PongPaddle {
  constructor(pos, elm, speed = 1) {
    this._pos = pos;
    this._element = elm;
    this.speed = speed;
    this.move = {
      up: (...theArgs) => this.#moveUp(...theArgs),
      down: (...theArgs) => this.#moveDown(...theArgs),
    };
  }

  #moveUp(delta) {}
  #moveDown(delta) {
    console.log(delta);
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
