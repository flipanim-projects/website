const FlipAnim = (function () {
	const $ = function (id) {
		return document.querySelector(id);
	};
	document.body.insertAdjacentHTML(
		"beforeend",
		`<div class="modal-container"></div>`
	);
	
	$("#logOut").onclick = () => {
		let modal = new Modal({
			title: "Are you sure you want to log out?",
			description: "This session will be terminated",
			buttons: [{
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