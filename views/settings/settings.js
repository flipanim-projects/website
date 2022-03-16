function FlipAnimSettings(user) {
  const $ = function (id) { return document.getElementById(id) }
  let form = $('form')
  form.onsubmit = () => {
    let data = new FormData()
    let values = {
      displayName: $('displayName').value,
      bio: $("bio").value
    }
    data.set('displayName', values.displayName)
    data.set('bio', values.bio)
    data.set('h-captcha-response', values.hcaptcha)
    fetch('/api/v1/users/' + $('userID').value, {
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
      type: 1,
      actions: {
        inputs: [{
          placeholder: 'Username',
          value: user.name.text,
          name: 'username'
        }, {
          placeholder: 'Current password',
          name: 'curPassword'
        }, {
          placeholder: 'New password',
          name: 'newPassword'
        }, {
          placeholder: 'Confirm new password',
          name: "confirmNewPassword"
        }],
        buttons: [
          { text: 'Cancel', type: 'cancel', action: modal.hide() },
          { text: 'Save', type: 'proceed' },
        ]
      }
    });
    modal.init().show();
  }
}
FlipAnimSettings(loggedIn)
