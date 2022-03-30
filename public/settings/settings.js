const read = require("body-parser/lib/read")

function FlipAnimSettings(user) {
  window.selectedTheme = undefined
  const $ = function (id) { return document.getElementById(id) }
  function toast(t, d, du) {
    try {
      return new Toast({
        title: t,
        description: d,
        duration: du
      })
    } catch (err) {
      console.error(err)
    }
  }
  let modal = new Modal({
    title: "Change password",
    type: 1,
    form: {
      action: '/api/v1/users/' + $('userID').value + '/auth',
      method: 'PUT',
      inputs: [
        'curPassword', 'newPassword', 'confirmNewPassword', 'captcha'
      ], body: {
        'hcaptcha-response': window.captchaPasswordResponse
      }
    },
    content: {
      inputs: [{
        placeholder: 'Current password',
        name: 'curPassword',
        type: 'password',
        attrs: { autocomplete: 'current-password' }
      }, {
        placeholder: 'New password',
        name: 'newPassword',
        type: 'password',
        attrs: { autocomplete: 'new-password' }
      }, {
        placeholder: 'Confirm new password',
        name: "confirmNewPassword",
        type: 'password',
        attrs: { autocomplete: 'new-password' }
      }],
      extraHTML: [
        `<div class="h-captcha" id="changePassword" name="change-password" data-callback="hcaptchaPasswordCallback" data-sitekey='aa5d6fa4-a22e-4f29-812f-09d146df8c43'></div>`
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
  let submitted = false
  function submitHandler() {
    if (submitted == true) return
    submitted = true
    let inputs = {
      bio: $('bio').value,
      displayName: $('displayName').value,
      theme: window.selectedTheme ? window.selectedTheme : user.preferences.theme
    }
    let fdata = new FormData()
    fdata.append('bio', inputs.bio)
    fdata.append('displayName', inputs.displayName)
    fdata.append('h-captcha-response', window.hcaptchaResponse)
    fdata.append('theme', inputs.theme)
    fdata = JSON.stringify(Object.fromEntries(fdata.entries()))

    fetch('/api/v1/users/' + $('userID').value + '/information', {
      method: 'PUT',
      body: fdata,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(resp => {
      resp.json().then(res => {
        console.log(res)
        if (res.status === 200) {
          toast('Success', 'Your settings have been updated', 5).init().show()
          window.location.href = '/profile?user=' + $('userID').value
        } else if (res.status === 400 && res.message !== '400 Bad Request: No data provided') {
          toast('Invalid captcha', 'Please fill out the captcha to prove you are not a robot =)', 5).init().show()
        } else if (res.status === 400 && res.message === '400 Bad Request: No data provided') {
          toast('No data provided', 'Please fill out all the fields', 5).init().show()
        } else if (res.status === 413 && res.message === '413 Payload Too Large: Bio too long') {
          toast('Too long', 'Your bio is too long, make it under 120 characters', 5).init().show()
        } else if (res.status === 429) {
          toast('Too many requests', 'Please try again later, you are being ratelimited').init().show()
        } else if (res.status === 500) {
          toast('Internal server error', 'Please try again later, something went wrong', 5).init().show()
        }
      })
    })
  }
  $('settingsForm').onsubmit = function (e) {
    submitHandler()
    e.preventDefault();
    return false
  }
} window.hcaptchaCallback = function (token) {
  window.hcaptchaResponse = token
}
window.hcaptchaPasswordCallback = function (token) {
  window.hcaptchaPasswordResponse = token
}
FlipAnimSettings(loggedIn)
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