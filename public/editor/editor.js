const FlipAnimEditor = function () {
  class Canvas {
    constructor() {

      this.Listener = class {
        constructor() {
          this.init = function (toolset, canvas) {
            let tools = document.querySelectorAll(".tool-wrap");
            for (let i = 0; i < tools.length; i++) {
              let tool = tools[i].getAttribute("data-tool");
              if (tool) document.addEventListener("keydown", function (e) {
                if (e.key === toolset[tool].keystroke) toolClickHandler()
              });
              function toolClickHandler() {
                let active = document.querySelector(".selected");
                if (active) {
                  active.classList.remove("selected");
                }
                tools[i].classList.add("selected");
                toolset[tool].execute(canvas, toolset[tool].settings);
                // Update the settings for the tool
                let container = document.querySelector(`.tool-settings`);
                container.innerHTML = ''
                function bulkSetAttribute(el, attrs) {
                  for (const attr in attrs) {
                    el.setAttribute(attr, attrs[attr])
                  }
                }
                for (const element in toolset[tool].settingsInterface) {
                  let setting = toolset[tool].settingsInterface[element];
                  let input = document.createElement("input");
                  let toolWrapper = document.createElement("div");
                  toolWrapper.classList.add("tool-setting");
                  bulkSetAttribute(input, {
                    type: setting.type, id: setting.id, value: setting.value, min: setting.min || false, max: setting.max || false, step: setting.step || false,
                  });
                  input.oninput = function () {
                    isNaN(parseInt(input.value)) ? input.value = input.value : input.value = parseInt(input.value);
                    toolset[tool].settings[setting.id] = input.value;
                    toolset[tool].execute(canvas, toolset[tool].settings);
                  }
                  toolWrapper.innerHTML = `<label>${setting.name}</label>`
                  toolWrapper.appendChild(input);
                  container.appendChild(toolWrapper);
                }
              }
              tools[i].addEventListener("click", function () {
                toolClickHandler()
              })
            }

            return this;
          };
        }
      };
      this.Toolset = class {
        constructor() {
          this.pencil = {
            keystroke: "q",
            settings: {
              width: 10,
              color: "#000000",
            },
            execute: function (el, settings) {
              function midPointBtw(p1, p2) {
                return {
                  x: p1.x + (p2.x - p1.x) / 2,
                  y: p1.y + (p2.y - p1.y) / 2,
                };
              }
              let ctx = el.getContext("2d");
              ctx.lineWidth = settings.width;
              ctx.lineJoin = ctx.lineCap = "round";
              var isDrawing,
                points = [];
              el.onmousedown = function (e) {
                isDrawing = true;
                points.push({ x: e.clientX - el.getBoundingClientRect().left, y: e.clientY - el.parentElement.offsetTop + document.documentElement.scrollTop });
              };
              el.onmousemove = function (e) {
                if (!isDrawing) return;
                ctx.globalCompositeOperation = "source-over";
                points.push({ x: e.clientX - el.getBoundingClientRect().left, y: e.clientY - el.parentElement.offsetTop + document.documentElement.scrollTop });
                var p1 = points[0],
                  p2 = points[1];

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                for (let i = 0; i < points.length; i++) {
                  var midPoint = midPointBtw(p1, p2);
                  ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                  p1 = points[i];
                  p2 = points[i + 1];
                }
                ctx.lineTo(p1.x, p1.y);
                ctx.strokeStyle = settings.color;
                ctx.stroke();
              };
              el.onmouseup = function () {
                isDrawing = false;
                points.length = 0;
              };
            }, settingsInterface: {
              width: {
                type: "range",
                min: 1,
                max: 50,
                step: 1,
                value: 10,
                name: 'Line width',
                id: 'width'
              }, color: {
                type: "color",
                value: "#000000",
                name: 'Line color',
                id: 'color'
              }
            }
          }, this.eraser = {
            keystroke: "w",
            settings: {
              width: 10,
            },
            execute: function (el, settings) {
              function midPointBtw(p1, p2) {
                return {
                  x: p1.x + (p2.x - p1.x) / 2,
                  y: p1.y + (p2.y - p1.y) / 2,
                };
              }
              let ctx = el.getContext("2d");
              ctx.lineWidth = settings.width;
              ctx.globalCompositeOperation = "destination-out";
              ctx.lineJoin = ctx.lineCap = "round";
              var isDrawing,
                points = [];
              el.onmousedown = function (e) {
                isDrawing = true;
                points.push({ x: e.clientX - el.getBoundingClientRect().left, y: e.clientY - el.parentElement.offsetTop + document.documentElement.scrollTop });
              };
              el.onmousemove = function (e) {
                if (!isDrawing) return;
                points.push({ x: e.clientX - el.getBoundingClientRect().left, y: e.clientY - el.parentElement.offsetTop + document.documentElement.scrollTop });
                var p1 = points[0],
                  p2 = points[1];

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                for (let i = 0; i < points.length; i++) {
                  var midPoint = midPointBtw(p1, p2);
                  ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                  p1 = points[i];
                  p2 = points[i + 1];
                }
                ctx.lineTo(p1.x, p1.y);
                ctx.strokeStyle = settings.color;
                ctx.stroke();
              };
              el.onmouseup = function () {
                isDrawing = false;
                points.length = 0;
              };

            }
          }, this.paintbucket = {
            keystroke: "r",
            settings: {
              color: "#000000",
              tolerance: 5,
            },
            execute: function (el, settings) {
              let ctx = el.getContext("2d");
              let col = settings.color.replace("#", "");
              if (!col) col = '000000';
              let color = parseInt(col, 16)
              let worker = new Worker('/public/editor/fill.js');
              el.onmousedown = function (e) {
                const { x, y } = { x: e.clientX - el.getBoundingClientRect().left, y: e.clientY - el.parentElement.offsetTop + document.documentElement.scrollTop };
                worker.postMessage({
                  canvas: {
                    imageData: ctx.getImageData(0, 0, el.width, el.height),
                    width: el.width,
                    height: el.height
                  },
                  color: color,
                  x: x,
                  y: y,
                  delta: settings.tolerance
                });
                worker.onmessage = function (e) {
                  ctx.putImageData(e.data, 0, 0);
                }
              }
            }, settingsInterface: {
              color: {
                type: "color",
                id: "color",
                name: "Color",
                value: "#000000"
              }, tolerance: {
                type: "range",
                id: "tolerance",
                name: "Tolerance",
                min: 1,
                max: 256,
                step: 1,
                value: 5
              }
            }
          }
        }
      };
      this.elements = [document.querySelector(".editor-active canvas")];
      this.FrameManager = class {
        constructor() {
          this.data = [
            {
              speed: 1,
              data: ''
            }
          ];
          this.addFrame = function () {
            this.data.push({
              speed: 1,
              data: ''
            });
          }
          this.editFrame = function (index, data) {
            this.data[index].speed = 1;
            this.data[index].data = data;
          }
          this.deleteFrame = function (index) {
            this.data.splice(index, 1);
          }
          this.moveFrame = function (index, newindex) {
            let temp = this.data[index];
            this.data.splice(index, 1);
            this.data.splice(newindex, 0, temp);
          }
          this.getFrame = function (index) {
            return this.data[index];
          }
          this.updateHTML = function () {
            document.querySelector("#frames").innerHTML = "";
            let html = '';
            for (let i = 0; i < this.data.length; i++) {
              html += `<div class="frame" data-index="${i}">
              <div class="frame-data">${this.data[i].data}</div>
              <div class="frame-speed">${this.data[i].speed}</div>
              <div class="frame-delete">X</div>
              <div class="frame-move">&#8593;</div>
              </div>`;
            }
            document.querySelector("#frames").innerHTML += html;
          }
          this.currentFrame = 0;
        }
      };
    }
  }

  const canvas = new Canvas();
  const listener = new canvas.Listener();
  const toolset = new canvas.Toolset();
  let frameManager = new canvas.FrameManager();
  let frames = frameManager.data
  listener.init(toolset, canvas.elements[0]);

  function debounce(func) {
    var timer;
    return function (event) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(func, 500, event);
    };
  }
  window.addEventListener('resize', debounce(function () {
    let ctx = canvas.elements[0].getContext("2d");
    let data = ctx.getImageData(0, 0, canvas.elements[0].width, canvas.elements[0].height);
    canvas.elements[0].width = canvas.elements[0].parentElement.offsetWidth;
    canvas.elements[0].height = canvas.elements[0].parentElement.offsetHeight;
    ctx.putImageData(data, 0, 0);
  }))
  canvas.elements[0].width = canvas.elements[0].parentElement.offsetWidth;
  canvas.elements[0].height = canvas.elements[0].parentElement.offsetHeight;
};
try {
  FlipAnimEditor();
} catch (e) {
  console.error(e);
}
