class Pong {
  constructor() {}

  render(element, cleanupCb) {
    $(element).html(
      `
      <div>hi bitch</div>
      <button id="pong_remove">exit</button>
      `
    );

    $("#pong_remove").on("click", () => {
      cleanupCb();
      $(element).remove();
    });
  }
}
