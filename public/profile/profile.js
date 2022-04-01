function FlipAnimProfile(user) {
    let loggedIn = user
    // Get which user the user is trying to view
    let query = window.location.search.replace('?', '')
    // Make a request to the API to fetch the user info
    fetch('/api/v1/users?' + query).then(
        resp => {
            resp.json().then(fin => { // Then set a variable to the user info
                // so we can access it later on
                user = fin;
                // Update the HTML with the newly fetched user info
                loadProfile(fin);
            }).catch(err => { // Request failed?
                profileNotFound() // Just say the user's not found :)
                console.error(err)
            })
        }
    )
    const $ = function (id) { return document.querySelector(id) }
    // Get the user id of the logged in user
    let uid = document.querySelector('#userID')

    // No query? Redirect to the logged in user's page
    if (!query && loggedIn) window.location.href = '?user=' + (uid.value)
    // Not logged in, AND no query? Redirect to login page
    else if (!query && !user) window.location.href = '/account/login'
    if (query.includes('&')) query = query.split('&')[0]

    function profileNotFound() {
        $('main').innerHTML = `<h1>User not found</h1>
        <p>The profile could not be loaded, as the user doesn't exist</p>
        <a style="cursor:pointer;text-decoration:underline;" onclick="window.history.go(-1)">&larr; Back</a>`
    }
    function toast(t, d, du) {
        return new Toast({
            title: t,
            description: d,
            duration: du
        })
    }
    let editStatusModal, toasts = {
        success: toast('Success', 'Successfully set status, reload to see your new status', 5),
        error: toast('Error', 'An error occurred while setting status', 5),
        tooLong: toast('Error', 'Status is too long', 5),
        ratelimited: toast('Error', 'You are sending requests too quickly', 5)
    }
    if (loggedIn) editStatusModal = new Modal({
        title: ('Edit Status'),
        description: (' '),
        type: 1,
        form: {
            inputs: ['newStatus', 'type'],
            action: '/api/v1/users/' + loggedIn.name.id + '/status',
            method: 'PUT',
            query: true,
            responses: {
                "200": function () {
                    toasts.success.init().show()
                    editStatusModal.hide()
                }, "400": function () {
                    toasts.error.init().show()
                }, "413": function () {
                    toasts.tooLong.init().show()
                }, "429": function () {
                    toasts.ratelimited.init().show()
                }, "500": function () {
                    toasts.error.init().show()
                }
            }
        },
        content: {
            inputs: [
                { placeholder: 'New Status... ', value: loggedIn.status.name ? loggedIn.status.name : '', name: 'newStatus' },
            ],
            extraHTML: [`<select id="type" value="${user.status.type}" name="type">
            <option value="0">Invisible</option>
            <option value="1">Online</option>
            <option value="2">Idle</option>
            <option value="3">Do Not Disturb</option>
            </select>`],
            buttons: [
                { text: 'Cancel', type: 'cancel' },
                { text: 'Save', type: 'proceed' }
            ]
        }
    }).init()

    function loadProfile(f) {
        console.log(f)
        // No data? User not found
        if (f === undefined) return profileNotFound()
        // Update the page title
        document.querySelector('title').innerHTML = 'FlipAnim | @' + f.name.text + '\'s profile'
        // Shorthand function for setting the html of a profile element
        function html(el, text) {
            el.innerHTML = text
            return el.classList.remove('skeleton')
        }
        // List of statuses. Since the API provides numbers
        // for statuses, we'll need to translate
        const statuses = {
            "0": 'Invisible',
            "1": 'Online',
            "2": 'Idle',
            "3": 'Do Not Disturb',
        }
        html($('.profile-name'), f.name.display ? f.name.display + ' <span> @' + f.name.text + '</span>' : '@' + f.name.text)
        if (f.badges.includes('admin')) { // User is admin?
            let admin = document.createElement('DIV')
            admin.classList.add('admin')
            $('.profile-name').appendChild(admin)
        }
        $(".profile-image").classList.remove('skeleton')
        let date = new Date(f.creation.text)
        html($('.profile-creation'), 'Created ' + date.toLocaleString())
        followerHTML(html, f);
        html($('.profile-bio'), f.bio ? f.bio : 'No bio')
        html($('.profile-status'), `
        <span class="profile-status-type ${statuses[f.status.type].replaceAll(' ', '')}">
        ${statuses[f.status.type]}</span>
        ${f.status.name ? ' | ' + f.status.name : ''}`)
        let edit = document.getElementById('editStatus')
        if (loggedIn) {
            edit.classList.add('edit')
            edit.setAttribute('data-tooltip', 'edit')
            edit.onclick = () => {
                try { editStatusModal.show(); $('#type').children[user.status.type].selected = 'true' }
                catch (err) { console.error(err) }
            }
        }
        loadAnims(f.anims, f)
    }

    function followerHTML(html, f) {
        if (!loggedIn) {
            html($('.profile-follow.ers'), 'Follow (' + f.followers.length + ')');
            $('.profile-follow.ers').classList.add('clickable')
            $('.profile-follow.ing').remove()
            $('.profile-follow.ers').onclick = () => {
                window.location.href = '/account/login'
            }
            return
        }
        if (f.name.id === loggedIn.name.id) {
            html($('.profile-follow.ers'), f.followers.length + ' followers');
            html($('.profile-follow.ing'), 'Following ' + f.following.length);
        } else {
            $('.profile-follow.ing').remove()
            if (f.followers.includes(loggedIn.name.id)) {
                html($('.profile-follow.ers'), 'Following (' + f.followers.length + ')');
                $('.profile-follow.ers').classList.add('clickable')
            } else {
                html($('.profile-follow.ers'), 'Follow (' + f.followers.length + ')');
                $('.profile-follow.ers').classList.add('clickable')
                $('.profile-follow.ers').onclick = () => {
                    fetch('/api/v1/users/' + f.name.id + '/followers', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }).then(res => {
                        if (res.status === 200) {
                            $('.profile-follow.ers').classList.remove('submitting')
                            f.followers.push(user.id)
                            html($('.profile-follow.ers'), 'Following (' + f.followers.length + ')')
                            toast('Success', 'You are now following ' + f.name.text, 5).init().show()
                        } else if (res.status === 429) {
                            toast('Error', 'You are sending requests too quickly', 5).init().show()
                        } else if (res.status === 500) {
                            toast('Error', 'An error occurred while following ' + f.name.text, 5).init().show()
                        } else if (res.status === 409) {
                            toast('Error', 'You are already following ' + f.name.text, 5).init().show()
                        } else if (res.status === 404) {
                            toast('Error', 'User not found', 5).init().show()
                        }
                    })
                    $('.profile-follow.ers').classList.add('submitting')
                }
                $('.profile-follow.ing').style.display = 'none';
            }
        }
    }

    function loadAnims(anims, user) {
        for (let i = 0; i < anims.length; i++) {
            let anim = document.createElement('DIV')
            anim.classList.add('anim')
            anim.onclick = () => {
                window.location.href = '../anim/?id=' + anims[i].id
            }
            anim.innerHTML += `<div class="anim-text">
            <h1>${anims[i].name}</h1>
            <h2>by ${user.name.text}</h2>
            </div>`
            $('.profile-anims').appendChild(anim)
        }
        if (anims.length == 0) {
            return $('.profile-anims').innerHTML += ('No anims<br><br>')
        }
    }
    if (window.location.search.includes('justCreated=true')) {
        toast('Your account was just created', '<a href="/account/login">Click here</a> to log in with your new account').init().show()
    }
}
var user = loggedIn ? loggedIn : false
FlipAnimProfile(user)