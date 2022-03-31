const FlipAnimLogin = function () {
    const $ = id => { return document.querySelector(id) }
    function toast(t, d, du) {
        new Toast({
            title: t,
            description: d,
            duration: du
        }).init().show()
        loginBtn.classList.remove('submitting')
    }
    function login(username, password, captcha) {
        let fdata = new FormData()
        fdata.append('username', username)
        fdata.append('password', password)
        fdata.append('h-captcha-response', captcha)
        fdata = JSON.stringify(Object.fromEntries(fdata.entries()))

        fetch('/api/v1/login', {
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
                } else if (res.status == 401) {
                    toast('Invalid credentials', 'Your username or password is incorrect', 5)
                    window.hcaptcha.reset()
                } else if (res.status == 200 || res.status == 302) {
                    toast('Logged in', 'Redirecting to the main page...', 5)
                    window.location.href = '/'
                } else if (res.status == 429) {
                    toast('Too many requests', 'Please try again later, you are being ratelimited')
                }
            }).catch(err => {
                console.log(err)
                console.log(resp)
            })
        })
    }
    $('#login').onsubmit = e => {
        if (!$('#username').value || !$('#password').value) {
            toast('Invalid credentials', 'Please fill out the username and password fields', 5)
            e.preventDefault()
            return
        }
        login(
            $('#username').value,
            $('#password').value,
            window.captchaResponse ? window.captchaResponse : ''
        )
        e.preventDefault()
        return false;
    }
    let loginBtn = $('input[type=submit]')
    loginBtn.onclick = e => {
        let btn = e.target
        btn.classList.add('submitting')
    }
}
function hcaptchaCallback(resp) {
    window.captchaResponse = resp
}
FlipAnimLogin()