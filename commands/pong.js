class Pong {
  constructor() {
    this.leftPaddle;
    this.rightPaddle;
    this._lastTick = 0;
    this._exit = false;
    this.containerElement;
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

    this.tick(0);
  }

  tick(delta) {
    if (this._exit || $("#" + this.containerElement[0].id).length === 0) {
      this._exit = false;
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

  #moveUp(delta) {
    console.log(...arguments);
  }
  #moveDown(delta) {}
}
