const FlipAnim = function (loggedIn) {
	const $ = (id) => document.querySelector(id);
	if (!$(".modal-container"))
		document.body.insertAdjacentHTML(
			"beforeend",
			`<div class="modal-container"></div>`
		);
	let modal;
	if (loggedIn.name) {
		$("#profileLink").onclick = () =>
			(document.location.href = "/profile?user=" + loggedIn.name.id);
		$("#settings").onclick = () => (document.location.href = "/settings");
	}
};

onload = () => FlipAnim(localStorage.getItem("u"));
