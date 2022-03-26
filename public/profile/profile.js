function FlipAnimProfile(loggedIn) {
    const $ = function (id) { return document.querySelector(id) }

    // Get which user the user is trying to view
    let query = window.location.search.replace('?', '')
    // Get the user id of the logged in user
    let uid = document.querySelector('#userID')

    // No query? Redirect to the logged in user's page
    if (!query && loggedIn) window.location.href = '?user=' + (uid.value)
    // Not logged in, AND no query? Redirect to login page
    else if (!query && !loggedIn) window.location.href = '/account/login'
    if (query.includes('&')) query = query.split('&')[0]
    // Update the page title
    document.querySelector('title').innerHTML = 'FlipAnim | @' + loggedIn.name.text + '\'s profile'
    fetch('/api/v1/users?' + query).then(
        resp => {
            console.log(resp.body)
            resp.json().then(fin => {
                loggedIn = fin; loadProfile(fin);
            }).catch(err => {
                profileNotFound()
                console.error(err)
            })
        }
    )
    function profileNotFound() {
        $('main').innerHTML = `<h1>User not found</h1>
        <p>The profile could not be loaded, as the user doesn't exist</p>
        <a style="cursor:pointer;text-decoration:underline;" onclick="window.history.go(-1)">&larr; Back</a>`
    }
    function loadProfile(data) {
        function html(el, text) {
            el.innerHTML = text
            return el.classList.remove('skeleton')
        }
        const statuses = {
            "0": 'Invisible',
            "1": 'Online',
            "2": 'Idle',
            "3": 'Do Not Disturb',
        }

        if (loggedIn === undefined) return $('.profile-basic-info').innerHTML = '<h1>User not found</h1>'
        html($('.profile-name'), loggedIn.name.display + ' <span> @' + loggedIn.name.text + '</span>')
        if (loggedIn.admin === true) {
            let admin = document.createElement('DIV')
            admin.classList.add('admin')
            $('.profile-name').appendChild(admin)
        }
        $(".profile-image").classList.remove('skeleton')
        html($('.profile-creation'), 'Created ' + loggedIn.creation.text)
        html($('.profile-follow.ers'), loggedIn.followers.length + ' followers')
        html($('.profile-follow.ing'), 'Following ' + loggedIn.following.length)
        if (loggedIn.bio) html($('.profile-bio'), loggedIn.bio)

        html($('.profile-status'), `<span class="profile-status-type ${statuses[loggedIn.status.type]}">${statuses[loggedIn.status.type]}</span>${loggedIn.status.name ? ' | ' + loggedIn.status.name : ''}`)

        loadAnims(loggedIn.anims, loggedIn)
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
}
FlipAnimProfile(loggedIn)