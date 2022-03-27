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
    // Make a request to the API to fetch the user info
    fetch('/api/v1/users?' + query).then(
        resp => { 
            resp.json().then(fin => { // Then set a variable to the user info
                // so we can access it later on
                loggedIn = fin;
                // Update the HTML with the newly fetched user info
                loadProfile(fin);
            }).catch(err => { // Request failed?
                profileNotFound() // Just say the user's not found :)
                console.error(err)
            })
        }
    )
    function profileNotFound() {
        $('main').innerHTML = `<h1>User not found</h1>
        <p>The profile could not be loaded, as the user doesn't exist</p>
        <a style="cursor:pointer;text-decoration:underline;" onclick="window.history.go(-1)">&larr; Back</a>`
    }
    let editStatusModal = new Modal({
        title: ('Edit Status'),
        description: (' '),
        content: {
            buttons: [
                { name: 'Cancel' },
                { name: 'Save' }
            ]
        }
    })
    editStatusModal.init()
    function loadProfile() {
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
        // No data? User not found
        if (loggedIn === undefined) return profileNotFound()
        html($('.profile-name'), loggedIn.name.display + ' <span> @' + loggedIn.name.text + '</span>')
        if (loggedIn.badges.includes('admin')) { // User is admin?
            let admin = document.createElement('DIV')
            admin.classList.add('admin')
            $('.profile-name').appendChild(admin)
        }
        $(".profile-image").classList.remove('skeleton')
        html($('.profile-creation'), 'Created ' + loggedIn.creation.text)
        html($('.profile-follow.ers'), loggedIn.followers.length + ' followers')
        html($('.profile-follow.ing'), 'Following ' + loggedIn.following.length)
        if (loggedIn.bio) html($('.profile-bio'), loggedIn.bio)

        html($('.profile-status'), `
        <span class="profile-status-type ${statuses[loggedIn.status.type]}">
        ${statuses[loggedIn.status.type]}</span>
        ${loggedIn.status.name ? ' | ' + loggedIn.status.name : ''}`)
        let edit = document.createElement('DIV')
        edit.classList.add('edit')
        edit.setAttribute('data-tooltip','edit')
        edit.onclick = () => {
            console.log(editStatusModal)
            try { editStatusModal.show() }
            catch(err) {console.log(err)}
        }
        $('.profile-status-header').appendChild(edit)
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