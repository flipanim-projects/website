const FlipAnimEditor = function () {
  class Canvas {
    constructor() {
      this.Listener = class {
        constructor() {
          this.init = function (toolset, canvas) {
            let tools = document.querySelectorAll(".tool-wrap");
            for (let i = 0; i < tools.length; i++) {
              tools[i].addEventListener(
                "click",
                function () {
                  let tool = tools[i].getAttribute("data-tool");
                  let active = document.querySelector(".selected");
                  if (active) {
                    active.classList.remove("selected");
                  }
                  tools[i].classList.add("selected");
                  console.log(tool);
                  try {
                      toolset[tool](canvas);
                    } catch (err) {
                        console.log(err);
                        }
                }.bind(this)
              );
              console.log("tool clicked");
            }
            return this;
          };
        }
      };
      this.Toolset = class {
        constructor() {
          this.pencil = function (el) {
            function midPointBtw(p1, p2) {
              return {
                x: p1.x + (p2.x - p1.x) / 2,
                y: p1.y + (p2.y - p1.y) / 2,
              };
            }
            let ctx = el.getContext("2d");
            ctx.lineWidth = 10;
            ctx.lineJoin = ctx.lineCap = "round";
            var isDrawing,
              points = [];
            el.onmousedown = function (e) {
              isDrawing = true;
              points.push({ x: e.clientX, y: e.clientY });
            };
            el.onmousemove = function (e) {
              if (!isDrawing) return;
              console.log("mousemove");
              points.push({ x: e.clientX, y: e.clientY });
              var p1 = points[0],
                p2 = points[1];

              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              console.log(points);
              for (let i = 0; i < points.length; i++) {
                var midPoint = midPointBtw(p1, p2);
                ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                p1 = points[i];
                p2 = points[i + 1];
              }
              ctx.lineTo(p1.x, p1.y);
              ctx.strokeStyle = "black";
              ctx.stroke();
            };
            el.onmouseup = function () {
              isDrawing = false;
              points.length = 0;
            };
          };
          this.eraser = function () {};
        }
      };
      this.elements = [document.querySelector(".editor-active canvas")];
    }
  }

  const canvas = new Canvas();
  const listener = new canvas.Listener();
  const toolset = new canvas.Toolset();
  console.log(canvas.elements[0])
  listener.init(toolset, canvas.elements[0]);
};
try {
  FlipAnimEditor();
} catch (e) {
  console.error(e);
}