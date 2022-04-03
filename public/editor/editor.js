const FlipAnimEditor = function () {
    class Canvas {
        constructor() {
            this.Listener = class {
                constructor() {
                    this.init = function () {
                        let tools = document.querySelectorAll('.tool-wrap')
                        for (let i = 0; i < tools.length; i++) {
                            tools[i].addEventListener('click', function () {
                                let tool = tools[i].getAttribute('data-tool')
                                let active = document.querySelector('.selected')
                                if (active) {
                                    active.classList.remove('selected')
                                }
                                tools[i].classList.add('selected')
                                this.setTool(tool)
                            }.bind(this))
                        }
                        return this
                    }
                    this.setTool = function (tool) {
                        window.currentTool = tool
                        return this
                    }
                }
            }
            this.Toolset = class {
                constructor() {
                    this.pencil = function (el, ctx) {
                        function midPointBtw(p1, p2) {
                            return {
                                x: p1.x + (p2.x - p1.x) / 2,
                                y: p1.y + (p2.y - p1.y) / 2
                            };
                        }
                        ctx.lineWidth = 10;
                        ctx.lineJoin = ctx.lineCap = 'round';
                        var isDrawing, points = [];
                        el.onmousedown = function (e) {
                            isDrawing = true;
                            points.push({ x: e.clientX, y: e.clientY });
                        };
                        el.onmousemove = function (e) {
                            if (!isDrawing) return;
                            points.push({ x: e.clientX, y: e.clientY });
                            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                            var p1 = points[0], p2 = points[1];

                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            for (var i = 1, len = points.length; i < len; i++) {
                                var midPoint = midPointBtw(p1, p2);
                                ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                                p1 = points[i];
                                p2 = points[i + 1];
                            }
                            ctx.lineTo(p1.x, p1.y);
                            ctx.stroke();
                        };
                        el.onmouseup = function () {
                            isDrawing = false;
                            points.length = 0;
                        };
                    }
                    this.eraser = function () { }
                    this.selected = null
                }
            }
        }

    }

    const canvas = new Canvas()
    const listener = new canvas.Listener()
    const toolset = new canvas.Toolset()
    listener.init()
}()