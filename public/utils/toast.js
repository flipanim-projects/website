class Toast {
    constructor(obj) {
        this.title = obj.title
        this.description = obj.description
        this.duration = obj.duration * 1000
        this.init = function () {
            let toastcont = document.querySelector('.toast-container')
            let toast = document.createElement('DIV')
            toast.classList.add('toast')
            toast.innerHTML = `<b>${this.title}</b>
    <p>${this.description}</p>`
            toastcont.appendChild(toast)
            this.element = toast
            return this
        }
        this.show = function () {
            let toaststruct = this
            setTimeout(function () { toaststruct.element.classList.add('showing') })
            setTimeout(function () {
                toaststruct.element.classList.remove('showing')
                setTimeout(function () {
                    toaststruct.element.remove()
                }, 500)
            }, this.duration)
            return this
        }
    }
}