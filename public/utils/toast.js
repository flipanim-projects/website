class Toast {
    constructor(a) {
        if (a.constructor === Array) {
            this.title = a[0];
            this.description = a[1];
            this.duration = a[2] ? a[2] * 1000 : 5000;
            return;
        }
        this.title = a.title
        this.description = a.description
        this.duration = a.duration ? a.duration * 1000 : 5000;
    }
    init() {
        let b = document.querySelector(".toast-container"),
            a = document.createElement("DIV");
        console.log(this.classes)
        a.classList.add("toast")
        a.innerHTML = `<b>${this.title}</b><p>${this.description}</p>`
        b.appendChild(a), this.element = a
        return this
    }
    show() {
        this.element.classList.add("showing")
        let a = this;
        setTimeout(function () {
            a.element.classList.remove("showing")
            setTimeout(function () { a.element.remove() }, 1000)
        }, this.duration);
        return this
    }
}