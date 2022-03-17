function FlipAnimSettings(user) {
  const $ = function (id) { return document.getElementById(id) }
  console.log(user)
  $('changePass').onclick = () => {
    let modal = new Modal({
      title: "Change password",
      type: 1,
      form: {
        action: '/api/v1/users/' + $('userID').value + '/auth',
        method: 'PUT'
      },
      actions: {
        inputs: [{
          placeholder: 'Current password',
          name: 'curPassword',
          type: 'password',
        }, {
          placeholder: 'New password',
          name: 'newPassword',
          type: 'password'
        }, {
          placeholder: 'Confirm new password',
          name: "confirmNewPassword",
          type: 'password'
        }],
        buttons: [
          { text: 'Cancel', type: 'cancel' },
          { text: 'Save', type: 'proceed' },
        ]
      }
    });
    modal.init().show();
  }
}

FlipAnimSettings(loggedIn)