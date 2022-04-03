const FlipAnimCreateAccount = function () {
  const $ = id => { return document.querySelector(id) }
  let createBtn = $('input[type=submit]')
  function toast(t, d, du) {
    new Toast({
      title: t,
      description: d,
      duration: du
    }).init().show()
  }
  function create(username, password, captcha,email) {
    let fdata = new FormData()
    fdata.append('username', username)
    fdata.append('password', password)
    fdata.append('h-captcha-response', captcha)
    fdata.append('email', email)
    fdata = JSON.stringify(Object.fromEntries(fdata.entries()))
    createBtn.classList.add('submitting')
    fetch('/api/v1/users', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: fdata
    }).then(resp => {
      resp.json().then(res => {
        createBtn.classList.remove('submitting')
        if (res.status == 400) {
          toast('Invalid captcha', 'Please fill out the captcha to prove you are not a robot =)', 5)
        } else if (res.status == 201 || res.status == 302) {
          toast('Success', 'Your account was created, redirecting to your profile...', 5)
          window.location.href = '/profile?user=' + res.message.split('|')[1] + '&justCreated=true'
        } else if (res.status === 409) {
          toast('Username already taken', 'Please choose another username', 5)
        } else if (res.status == 429) {
          toast('Too many requests', 'Please try again later, you are being ratelimited')
        }
      })
    })
  }
  function submitHandler() {
    if (!$('#username').value || !$('#password').value || !$('#email').value) {
      toast('No data', 'Please fill out the username, email and password fields', 5)
      return
    }
    if ($('#username').value.length < 3 || $('#username').value.length > 20) {
      
      return toast('Invalid username', 'Username must be between 3 and 20 characters', 5)
    } else if ($('#username').value.includes(' ')) {
      
      return toast('Invalid username', 'Username cannot contain spaces, you can add those in your display name later on', 5)
    } else if ($('#username').value.includes('/')) {
      
      return toast('Invalid username', 'Username cannot contain slashes', 5)
    }
    let toFilter = $('#username').value.toLowerCase()
    let reserved = ["VideoGameDude", "Sharkiiie", "Flippy", "Deku-Kun2", "Infinity999", "Starshifter", "Worthings", "Worthlessness", "ViViHelico", "one", "FluffyGraffes", "Bugtoast", "Fazerlazer321", "Ak.", "Thatwaffle99", "wafels", "Its_Dev3230", "Infienthusiastowo", "catarie", "Link", "the-dumb-dino"]
    for (let i = 0; i < reserved.length; i++) {
      if (toFilter.includes(reserved[i].toLowerCase())) {
        
        return toast('Username is reserved', 'Contact a site admin privately to temporarily un-reserve this username, so you can register it', 10)
      } 
    }

    let whitelist = new RegExp(`^(?:[\u0000-\u00f0]+)$`,'g')
    if (!whitelist.test(toFilter)) {
      
      return toast('Invalid username', 'Username can\'t contain special characters', 5)
    }


    if (!window.captchaResponse) {
      toast('No captcha', 'Please fill out the captcha to prove you are not a robot =)', 5)
      return
    }
    let emailregex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
    if (!emailregex.test($('#email').value)) {
      
      return toast('Invalid email', 'Please enter a valid email', 5)
    }
    create(
      $('#username').value,
      $('#password').value,
      window.captchaResponse ? window.captchaResponse : '',
      $('#email').value
    )

  }
  $('#create').onsubmit = e => {
    e.preventDefault()
    submitHandler()
    return false;
  }

  createBtn.onclick = e => {
    let btn = e.target
    submitHandler()
  }
}
function hcaptcha(resp) {
  window.captchaResponse = resp
}
FlipAnimCreateAccount()
