class Pong {
  constructor() {
    this._leftPaddle = { pos: { y: 0 } };
    this._rightPaddle = { pos: { y: 0 } };
    this._lastTick = 0;
    this._exit = false;
    this.containerElement;
  }

  set lastTick(number) {
    this._lastTick = number;
  }

  get lastTick() {
    return this._lastTick;
  }

  set leftPaddle(object) {
    this._leftPaddle = object;
  }

  get leftPaddle() {
    return this._leftPaddle;
  }

  set rightPaddle(object) {
    this._rightPaddle = object;
  }

  get rightPaddle() {
    return this._rightPaddle;
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
    this.leftPaddle = {
      pos: {
        y: window
          .getComputedStyle(document.getElementById("pong__left"))
          .getPropertyValue("--y"),
      },
    };
    this.rightPaddle = {
      pos: {
        y: window
          .getComputedStyle(document.getElementById("pong__right"))
          .getPropertyValue("--y"),
      },
    };
    console.log(this);

    this.tick(0);
  }

  tick(delta) {
    if (this._exit || $("#" + this.containerElement[0].id).length === 0) {
      this._exit = false;
      return;
    }

    window.requestAnimationFrame((time) => {
      this.tick.call(this, time - this.lastTick);
      this.lastTick = time;
    });
  }
}
