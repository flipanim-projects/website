const $ = function (id) { document.getElementById(id) }
let subm = $('subm')
subm.onclick = () => {
    let data = new FormData()
    let values = {
        displayName: $('displayName').value,
        bio: $("bio").value
    }
    data.set('displayName', values.displayName)
    data.set('bio', values.bio)
    fetch('/api/v1/users/' + $('userId').value, {
        'method': 'PUT',
        'Content-Type': 'application/x-www-form-urlencoded',
        body: data
    }).then((resp) => {
        console.log(resp)
    })
}
$('changePass').onclick = () => {
    let modal = new Modal({
        title: "Change password",
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
}