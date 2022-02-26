const FlipAnim = (function () {
  const $ = function (id) {
    return document.querySelector(id);
  };
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="modal-container"></div>`
  );
  class Modal {
    constructor(opts) {
      this.title = opts.title;
      this.description = opts.description;
      this.buttons = opts.buttons;
      this.init = function () {
        let modal = document.createElement("DIV");
        modal.classList.add("modal");
        let buttons = document.createElement("DIV");
        buttons.classList.add("modal-buttons");
        for (let i = 0; i < this.buttons.length; i++) {
          let button = document.createElement("BUTTON");
          button.innerHTML = this.buttons[i].text;
          button.onclick = this.buttons[i].action
          button.classList.add(this.buttons[i].type);
          buttons.appendChild(button);
        }
        modal.innerHTML = `<h1>${this.title}</h1>
                <p>${this.description}</p>`;
        modal.appendChild(buttons);
        this.modal = modal;
        $(".modal-container").appendChild(modal);
        return this;
      };
      this.show = function () {
          this.modal.classList.add("showing");
          $(".modal-container").classList.add("overlay");
          return this;
      };
      this.hide = function (m) {
          let modal = this.modal
          if (m) modal = m
        modal.classList.remove("showing");
        $(".modal-container").classList.remove("overlay");
        setTimeout(function () {
          modal.remove();
        }, 400);
        return this;
      };
    }
  }
  $("#logOut").onclick = () => {
    let modal = new Modal({
      title: "Are you sure you want to log out?",
      description: "This session will be terminated",
      buttons: [
        {
          text: "No",
          type: "cancel",
          action: function () {
            modal.hide()
          },
        },
        {
          text: "Yes",
          type: "proceed-dangerous",
          action: function () {
            alert("nothing here yet");
          },
        },
      ],
    });
    modal.init().show();
  };
})();
