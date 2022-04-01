'use strict';
function FlipAnimProfile(user) {
    'use strict';
    let loggedIn = user
    // Get which user the user is trying to view
    let query = window.location.search.replace('?', '')
    // Make a request to the API to fetch the user info
    fetch('/api/v1/users?' + query).then(
        resp => {
            if (resp.status === 200) {
                resp.json().then(fin => { // Then set a variable to the user info
                    // so we can access it later on
                    user = fin;
                    // Update the HTML with the newly fetched user info
                    loadProfile(fin);
                }).catch(err => { // Request failed?
                    profileNotFound() // Just say the user's not found :)
                    console.error(err)
                })
            } else if (resp.status === 404) { // User not found?
                profileNotFound()
            } else if (resp.status === 429) { // Too many requests?
                tooManyRequests()
            } 
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
    function tooManyRequests() {
        $('main').innerHTML = `<h1>Too many requests</h1>
        <p>You have made too many requests to get a user in a short period of time. Please wait a minute or two before trying again.</p>
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
        'use strict';
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
        if (loggedIn.name.id === f.name.id) {
            edit.classList.add('edit')
            edit.setAttribute('data-tooltip', 'edit')
            edit.onclick = () => {
                try { editStatusModal.show(); $('#type').children[user.status.type].selected = 'true' }
                catch (err) { console.error(err) }
            }
        }
        loadAnims(f.anims, f)
    }
    let followingBool
    function followerHTML(html, f) {
        'use strict';
        const ers = $('.profile-follow.ers');
        console.log(followingBool)
        if (!loggedIn) {
            /** Not logged in? Only show the number of followers */
            html(ers, 'Follow (' + f.followers.length + ')');
            ers.classList.add('clickable')
            $('.profile-follow.ing').remove()
            ers.onclick = () => {
                window.location.href = '/account/login'
            }
            return
        }
        if (f.name.id === loggedIn.name.id) {
            /* User is viewing their own profile? Show the number of followers and number the user is following */
            html(ers, f.followers.length + ' followers');
            html($('.profile-follow.ing'), 'Following ' + f.following.length);
        } else {
            /* User is viewing someone else's profile? Make the user be able to follow that user */
            if ($('.profile-follow.ing')) $('.profile-follow.ing').remove()
            // If the user is already following, OR if 
            if (f.followers.includes(loggedIn.name.id) || followingBool === false) {
                followingBool = !f.followers.includes(loggedIn.name.id)
                html(ers, 'Following (' + f.followers.length + ')');
                ers.classList.add('clickable')
                ers.classList.add('following')
            } else {
                html(ers, 'Follow (' + f.followers.length + ')');
                followingBool = !f.followers.includes(loggedIn.name.id)
                ers.classList.add('clickable')
            }
            ers.onclick = () => {
                ers.classList.add('submitting')
                fetch('/api/v1/users/' + f.name.id + '/followers', {
                    method: 'PUT',
                    body: `{\"follow\":\"${followingBool}\"}`,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(res => {
                    ers.classList.remove('submitting')
                    if (res.status === 200) {
                        if (followingBool === false) f.followers.splice(f.followers.indexOf(loggedIn.name.id), 1), console.log('removed' + loggedIn.name.id + ' from ' + f.name.text)
                        else f.followers.push(loggedIn.name.id), console.log('removed '+ loggedIn.name.id + ' from ' + f.name.text)
                        followingBool = !f.followers.includes(loggedIn.name.id)
                        toast('Success', `You are ${followingBool === true ? 'no longer following' : 'now following'} ${f.name.text}`).init().show()
                        followerHTML(html, f)
                    } else if (res.status === 500) { // Server error
                        toast('Error', `An error occurred while ${followingBool === true ? 'unfollowing' : 'following'} ${f.name.text}`).init().show()
                    } else if (res.status === 400) { // Bad request
                        toast('Error', `You are already ${followingBool === true ? 'not following' : 'following'} ${f.name.text}`, 5).init().show()
                    } else if (res.status === 429) { // Rate limited
                        toast('Error', 'You are spamming, how mean >:(', 5).init().show()
                    } else if (res.status === 409) { // Conflict
                        toast('Error', `You are already ${followingBool === true ? 'not following' : 'following'} ${f.name.text}`, 5).init().show()
                    } else { // Unknown error
                        toast('Error', 'An unknown error occurred', 5).init().show()
                    }
                })
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