
const FlipAnim = function (loggedIn) {
  const $ = function (id) {
    return document.querySelector(id);
  };
  if (!$('.modal-container')) document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="modal-container"></div>`
  );
  let modal 
  try {
    modal = new Modal({
      title: "Are you sure you want to log out?",
      description: "This session will be terminated",
      content: {
        buttons: [
          {
            text: "No",
            type: "cancel",
            action: function () {
              modal.hide();
            },
          },
          {
            text: "Yes",
            type: "dangerous",
            action: function () {
              fetch("/api/v1/logout", {
                method: "POST",
                redirect: "follow",
              }).then(() => {
                window.location.href = "/";
              });
            },
          },
        ],
      },
    }).init();
  } catch (err) {
    return console.error(err);
  }
  $("#logOut").onclick = () => {
    modal.show();
  };
  $("#profileLink").onclick = () => {
    document.location.href =
      "/profile?user=" + document.getElementById("userID").value;
  };
  $("#settings").onclick = () => {
    document.location.href = "/settings";
  };
  if (loggedIn && loggedIn.preferences.theme)
    document.querySelector("body").classList.add(loggedIn.preferredTheme);

  if (
    document.location.search.replace("?", "").split("=")[0] === "justLoggedOut"
  ) {
    //TODO
  }
  //fetch('http://0.0.0.0:3000/api/v1/session')
};
setTimeout(function(){
	FlipAnim(loggedIn)
},500)