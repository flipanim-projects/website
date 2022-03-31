class Modal {
  constructor(opts) {
    Object.assign(this, opts);
    this.init = function () {
      let modal = document.createElement(this.type === 1 ? "FORM" : "DIV"),
        actions = document.createElement("DIV"),
        buttons = document.createElement("DIV"),
        extras = document.createElement("DIV");

      modal.classList.add("modal");
      modal.style.display = "none";
      actions.classList.add("modal-actions");
      buttons.classList.add("modal-buttons");
      for (const html in this.content) {
        if (html == "inputs") inputs(this.content["inputs"]);
        else if (html == "buttons") _buttons(this.content["buttons"]);
        else extraHTML(this.content[html]);
      }
      let md = this;
      function inputs(data) {
        for (let j = 0; j < data.length; j++) {
          let input = document.createElement("INPUT");
          input.setAttribute("placeholder", data[j].placeholder);
          input.setAttribute("name", data[j].name);
          input.value = data[j].value || "";
          if (data[j].type) input.setAttribute("type", data[j].type);
          if (data[j].attrs) {
            for (const attr in data[j].attrs) {
              input.setAttribute(attr, data[j].attrs[attr])
            }
          }
          input.oninput = () => {
            md.form.body[data[j].name] = input.value;
          };
          actions.appendChild(input);
        }
      }
      function _buttons(data) {
        for (let k = 0; k < data.length; k++) {
          let button = document.createElement("BUTTON");
          button.innerHTML = data[k].text;
          button.onclick = data[k].action || function () { };
          if (data[k].type === "cancel") {
            button.onclick = (e) => {
              data[k].action ? data[k].action(e) : (function () { })();
              md.hide();
            };
          }

          button.classList.add(data[k].type);
          buttons.appendChild(button);
        }
      }
      function extraHTML(data) {
        for (let i = 0; i < data.length; i++) {
          let html = data[i];
          extras.innerHTML += html;
        }
      }
      modal.innerHTML = `<h1>${this.title}</h1>
            <p>${this.description || ""}</p>`;
      modal.appendChild(actions);
      modal.appendChild(extras);
      modal.appendChild(buttons);
      function flattenObj(obj, parent, res = {}) {
        for (let key in obj) {
          let propName = key;
          if (typeof obj[key] == 'object') {
            flattenObj(obj[key], propName, res);
          } else {
            res[propName] = obj[key];
          }
        }
        return res;
      }
      function parseURL(obj) {
        let str = [];
        for (let p in obj)
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        return '?' + str.join("&");
      }
      if (this.type === 1) {
        if (!this.form['body']) this.form['body'] = {};
        modal.getElementsByClassName("proceed")[0].onclick = () => {
          for (let i = 0; i < md.form.inputs.length; i++) {
            let cur = md.form.inputs[i];
            let el = document.getElementsByName(cur)[0];
            if (!el) continue;
            md.form["body"][cur] = el.value;
          }
          console.log(this.form.body)
          let url = this.form.action
          var params = {
            method: this.form.method
          }
          if (this.form.query) {
            url = this.form.action + parseURL(flattenObj(this.form.body))
          } else {
            let fdata = new FormData()
            for (const key in this.form.body) {
              fdata.append(key, this.form.body[key])
            }
            fdata = JSON.stringify(Object.fromEntries(fdata.entries()))
            params.body = fdata;
            params.headers = {
              'Content-Type': 'application/json'
            }
          }
          fetch(url, params).then(res => {
            if (this.form.responses) {
              this.form.responses[res.status](this)
              console.log(res)
            }
          });
          return this
        };
      }
      modal.onkeydown = (e) => {
        if (e.code === "Escape") md.hide();
      };
      this.modal = modal;
      if (this.type === 1) this.modal.onsubmit = e => {
        e.preventDefault(); return false
      }
      document.querySelector(".modal-container").appendChild(modal);
      return this;
    };
    this.show = function () {
      try {
        console.log(this.modal);
        this.modal.style.display = "block";
        this.modal.classList.add("showing");

        document.querySelector(".modal-container").classList.add("overlay");
      } catch (err) {
        return console.error(err);
      }
      return this;
    };
    this.hide = function (m) {
      let modal = this.modal;
      if (m) modal = m;
      modal.classList.remove("showing");
      setTimeout(function () {
        modal.style.display = "none";
      }, 400);
      document.querySelector(".modal-container").classList.remove("overlay");
      return this;
    };
  }
}
