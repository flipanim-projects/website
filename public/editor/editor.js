const FlipAnimEditor = function () {
    class Canvas {
        constructor() {
            this.Listener = class {
                constructor() {
                    this.init = function () {
                        onmousemove = e => {
                            return [e.clientX, e.clientY]
                        }
                    }
                }
            }
            this.Toolset = class {
                constructor() {
                    this.pencil = function () { }
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