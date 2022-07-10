const FlipAnim = function (loggedIn) {
    const $ = id => document.querySelector(id);
    if (!$(".modal-container"))
      document.body.insertAdjacentHTML(
        "beforeend",
        `<div class="modal-container"></div>`
      );
    let modal;
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
            }, {
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
    if (loggedIn.name) {
      $("#logOut").onclick = () => modal.show();
      $("#profileLink").onclick = () => document.location.href =
          "/profile?user=" + loggedIn.name.id;
      $("#settings").onclick = () => document.location.href = "/settings";
    }
  };
  
  onload = () => FlipAnim(localStorage.getItem('u'));