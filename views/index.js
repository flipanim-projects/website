const FlipAnim = (function() {
	const $ = function(id) {
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
			this.actions = opts.actions;
			this.init = function() {
				let modal = document.createElement("DIV");
				modal.classList.add("modal");
				let actions = document.createElement('DIV')
				actions.classList.add('modal-actions')
				let buttons = document.createElement("DIV");
				buttons.classList.add("modal-buttons");
				for (let i = 0; i < this.actions.length; i++) {
					if (this.actions[i].type == 'input') {
						let input = document.createElement("INPUT");
						input.setAttribute('placeholder', this.actions[i].inputPlaceholder)
					} else if (this.actions[i].type.split(' ')[0] === 'button') {
						let button = document.createElement("BUTTON");
						button.innerHTML = this.buttons[i].text;
						button.onclick = this.buttons[i].action
						button.classList.add(this.buttons[i].type.split(' ')[1]);
						buttons.appendChild(button);
					}
				}
				modal.innerHTML = `<h1>${this.title}</h1>
                <p>${this.description}</p>`;
				modal.appendChild(buttons);
				this.modal = modal;
				$(".modal-container").appendChild(modal);
				return this;
			};
			this.show = function() {
				this.modal.classList.add("showing");
				$(".modal-container").classList.add("overlay");
				return this;
			};
			this.hide = function(m) {
				let modal = this.modal
				if (m) modal = m
				modal.classList.remove("showing");
				$(".modal-container").classList.remove("overlay");
				setTimeout(function() {
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
			buttons: [{
					text: "No",
					type: "cancel",
					action: function() {
						modal.hide()
					},
				},
				{
					text: "Yes",
					type: "proceed-dangerous",
					action: function() {
						fetch('http://localhost:3000/api/v1/logout', {
							method: 'POST',
							redirect: 'follow'
						}).then(() => {
							window.location.href = '/'
						})
					},
				},
			],
		});
		modal.init().show();
	};
	$('#profileLink').onclick = () => {
		document.location.href = '/profile?user=' + document.getElementById('userID').value
	}
	$('#settings').onclick = () => {
		document.location.href = '/settings'
	}
	if (document.location.search.replace('?', '').split('=')[0] === 'justLoggedOut') {
		//TODO
	}
	//fetch('http://0.0.0.0:3000/api/v1/session')
})();