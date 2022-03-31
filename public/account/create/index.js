


const FlipAnimCreateAccount = function () {
  const $ = id => { return document.querySelector(id) }
  function toast(t, d, du) {
    new Toast({
      title: t,
      description: d,
      duration: du
    }).init().show()
    createBtn.classList.remove('submitting')
  }
  function create(username, password, captcha) {
    let fdata = new FormData()
    fdata.append('username', username)
    fdata.append('password', password)
    fdata.append('h-captcha-response', captcha)
    fdata = JSON.stringify(Object.fromEntries(fdata.entries()))

    fetch('/api/v1/users', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: fdata
    }).then(resp => {
      resp.json().then(res => {
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
    if (!$('#username').value || !$('#password').value) {
      toast('No data', 'Please fill out the username and password fields', 5)
      return
    }
    if ($('#username').value.length < 3 || $('#username').value.length > 20) {
      toast('Invalid username', 'Username must be between 3 and 20 characters', 5)
    } else if ($('#username').value.includes(' ')) {
      toast('Invalid username', 'Username cannot contain spaces, you can add those in your display name later on', 5)
    } else if ($('#username').value.includes('/')) {
      toast('Invalid username', 'Username cannot contain slashes', 5)
    }

    let reserved = ["LatticedDreams", "VideoGameDude", "Corruptandco", "Sharkiiie", "Flippy", "Ilysmfromm", "DanePerson", "Deku-Kun2", "Infinity999", "GearyOGuy", "Starshifter", "Worthings", "Worthlessness", "gafrield", "ViViHelico", "one", "FluffyGraffes", "Bugtoast", "Fazerlazer321", "Ak.", "jay", "Thatwaffle99", "wafels", "Its_Dev3230", "Infienthusiastowo", "catarie", "Queen-PufPuf", "Link", "the-dumb-dino", "Bakedbeano", "Poyo"]
    for (let i = 0; i < reserved.length; i++) {
      if ($('#username').value.toLowerCase().includes(reserved[i].toLowerCase())) return toast('Username is reserved', 'Contact a site admin privately to temporarily un-reserve this username, so you can register it', 10)
    }


    if (!window.captchaResponse) {
      toast('No captcha', 'Please fill out the captcha to prove you are not a robot =)', 5)
      return
    }
    create(
      $('#username').value,
      $('#password').value,
      window.captchaResponse ? window.captchaResponse : ''
    )

  }
  $('#create').onsubmit = e => {
    e.preventDefault()
    submitHandler()
    return false;
  }
  let createBtn = $('input[type=submit]')
  createBtn.onclick = e => {
    let btn = e.target
    btn.classList.add('submitting')
  }
}
function hcaptcha(resp) {
  window.captchaResponse = resp
}
FlipAnimCreateAccount()