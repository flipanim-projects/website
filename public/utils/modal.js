window.modal = undefined
class Modal {
    constructor(opts) {
        Object.assign(this, opts)
        this.init = function () {
            let modal = document.createElement("DIV"),
                actions = document.createElement('DIV'),
                buttons = document.createElement("DIV"),
                extras = document.createElement("DIV");

            modal.classList.add("modal");
            actions.classList.add('modal-actions')
            buttons.classList.add("modal-buttons");
            for (const html in this.content) {
                if (html == 'inputs') inputs(this.content['inputs'])
                else if (html == 'buttons') _buttons(this.content['buttons'])
                else extraHTML(this.content[html])
            }
            let md = this
            function inputs(data) {
                for (let j = 0; j < data.length; j++) {
                    let input = document.createElement("INPUT");
                    input.setAttribute('placeholder', data[j].placeholder)
                    input.setAttribute('name', data[j].name)
                    input.value = data[j].value || ''
                    if (data[j].type) input.setAttribute('type', data[j].type)
                    
                    input.oninput = () => {
                        md.form.body[data[j].name] = input.value
                    }
                    actions.appendChild(input)
                }
            }
            function _buttons(data) {
                for (let k = 0; k < data.length; k++) {
                    let button = document.createElement("BUTTON");
                    button.innerHTML = data[k].text;
                    button.onclick = data[k].action || function () { }
                    if (data[k].type === 'cancel') {

                        button.onclick = e => {
                            data[k].action ? data[k].action(e) : function () { }()
                            md.hide()
                        }
                    }

                    button.classList.add(data[k].type);
                    buttons.appendChild(button);
                }
            }
            function extraHTML(data) {
                for (let i = 0; i < data.length; i++) {
                    let html = data[i]
                    extras.innerHTML += html
                }
            }
            modal.innerHTML = `<h1>${this.title}</h1>
            <p>${this.description || ''}</p>`;
            modal.appendChild(actions);
            modal.appendChild(extras);
            modal.appendChild(buttons);

            if (this.type === 1) {
                this.form['body'] = {}
                modal.getElementsByClassName('proceed')[0].onclick = () => {
                    for (let i = 0; i < md.form.inputs.length; i++) {
                        let cur = md.form.inputs[i]
                        let el = document.getElementsByName(cur)[0]
                        if (!el) continue
                        md.form['body'][cur] = el.value
                    }
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
            if (window.modal === this.title) {
                this.modal.classList.add("showing");
            }
            window.modal = this.title
            document.querySelector(".modal-container").classList.add("overlay");
            return this;
        };
        this.hide = function (m) {
            let modal = this.modal
            if (m) modal = m
            modal.classList.remove("showing");
            document.querySelector(".modal-container").classList.remove("overlay");
            return this;
        };
    }
}
module.exports = Modal