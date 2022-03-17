class Modal {
    constructor(opts) {
        Object.assign(this,opts)
        this.init = function () {
            let modal = document.createElement("DIV"),
                actions = document.createElement('DIV'),
                buttons = document.createElement("DIV");
            
            modal.classList.add("modal");
            actions.classList.add('modal-actions')
            buttons.classList.add("modal-buttons");
            for (let j = 0; j < this.actions.inputs.length; j++) {
                let input = document.createElement("INPUT");
                input.setAttribute('placeholder', this.actions.inputs[j].placeholder)
                input.setAttribute('name', this.actions.inputs[j].name)
                input.value = this.actions.inputs[j].value || ''
                if (this.actions.inputs[j].type) input.setAttribute('type',this.actions.inputs[j].type)
                input.oninput = () => {
                    this.form.body[this.actions.inputs[j].name] = input.value
                    console.log(this.form.body)
                }
                actions.appendChild(input)
            } for (let k = 0; k < this.actions.buttons.length; k++) {
                let button = document.createElement("BUTTON");
                button.innerHTML = this.actions.buttons[k].text;
                button.onclick = this.actions.buttons[k].action
                button.classList.add(this.actions.buttons[k].type);
                buttons.appendChild(button);
            }
            modal.innerHTML = `<h1>${this.title}</h1>
            <p>${this.description || ''}</p>`;
            modal.appendChild(actions)
            modal.appendChild(buttons);

            if (this.type === 1) {
                this.form['body'] = {}
                modal.getElementsByClassName('proceed')[0].onclick = () => {
                    fetch(this.form.action, {
                        method: this.form.method,
                        body: this.form.body
                    })
                    this.hide
                }
            }
            this.modal = modal;
            document.querySelector(".modal-container").appendChild(modal);
            return this;
        };
        this.show = function () {
            this.modal.classList.add("showing");
            document.querySelector(".modal-container").classList.add("overlay");
            return this;
        };
        this.hide = function (m) {
            let modal = this.modal
            if (m) modal = m
            modal.classList.remove("showing");
            document.querySelector(".modal-container").classList.remove("overlay");
            setTimeout(function () {
                modal.remove();
            }, 400);
            return this;
        };
    }
}