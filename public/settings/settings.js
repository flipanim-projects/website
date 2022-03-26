function FlipAnimSettings(user) {
  const $ = function (id) { return document.getElementById(id) }
  console.log(user)
  let modal = new Modal({
    title: "Change password",
    type: 1,
    form: {
      action: '/api/v1/users/' + $('userID').value + '/auth',
      method: 'PUT',
      inputs: [
        'curPassword', 'newPassword', 'confirmNewPassword', 'captcha'
      ]
    },
    content: {
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
      extraHTML: [
        `<div class="h-captcha" id="captcha" name="captcha" data-callback="s.hcaptcha" data-sitekey='aa5d6fa4-a22e-4f29-812f-09d146df8c43'></div>`
      ],
      buttons: [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Save', type: 'proceed' },
      ]
    },
  });
  
  modal.init()
  $('changePass').onclick = () => {
    modal.show();
  }
  return {
    hcaptcha: function (token) {
      return token
    }
  }
}

var s = FlipAnimSettings(loggedIn)
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.onload = function () {
      resolve();
    };
    script.onerror = function () {
      reject();
    };
    script.src = src;
    document.body.appendChild(script);

  });
}
loadScript('https://js.hcaptcha.com/1/api.js')
loadScript = undefined