class Toast {
    constructor(a) {
        this.title = a.title
        this.description = a.description
        this.duration = 1e3 * a.duration || 5e3
    }
    init() {
        let b = document.querySelector(".toast-container"),
            a = document.createElement("DIV");
        a.classList.add("toast"), a.innerHTML =
            `<b>${this.title}</b><p>${this.description}</p>`
        b.appendChild(a), this.element = a
        return this
    }
    show() {
        this.element.classList.add("showing")
        let a = this;
        setTimeout(function () {
            a.element.classList.remove("showing")
            setTimeout(a.element.remove(), 500)
        }, this.duration);
        return this
    }
}