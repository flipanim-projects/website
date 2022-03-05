let query = document.location.search.replace('?', '')
document.querySelector('title').innerHTML = query

fetch('api/users?user=admin').then(
    resp => resp.json()
        .then(fin => {
            Users.data = fin; loadProfile();
        })
)

const Users = {
    fetch: function (id) {
        return this.data.findIndex(obj => {
            return obj.name.id === id
        })
    },
    at: function (ind) { return this.data[ind] },
    remove: function (ind) {
        return this.data.splice(ind, 1)
    },
    data: []
}

const $ = function (id) { return document.querySelector(id) }
function loadProfile(data) {
    const statuses = {
        "0": 'Invisible',
        "1": 'Online',
        "2": 'Idle',
        "3": 'Do Not Disturb',
    }
   
    let user = Users.at(Users.fetch(query.replace('user=', '')))
    if (user === undefined) return $('.profile-basic-info').innerHTML = '<h1>User not found</h1>'

    $('.profile-name').innerHTML = '@' + user.name.text
    if (user.admin === true) {
        let admin = document.createElement('DIV')
        admin.classList.add('admin')
        $('.profile-name').appendChild(admin)
    }
    $('.profile-creation').innerHTML = 'Created ' + user.creation.text
    $('.profile-follow.ers').innerHTML = user.followers.length + ' followers'
    $('.profile-follow.ing').innerHTML = 'Following ' + user.following.length

    $('.profile-bio').innerHTML = user.bio
    $('.profile-status-type').innerHTML = statuses[user.status.type]
    $('.profile-status-type').classList.add(statuses[user.status.type])
    $('.profile-status').innerHTML += ' | ' + user.status.name || ' '

    loadAnims(user.anims,user)
}

function loadAnims(anims,user) {
    for (let i = 0; i < anims.length; i++) {
        let anim = document.createElement('DIV')
        anim.classList.add('anim')
        anim.innerHTML += `<div class="anim-text">
            <h1>${anims[i].name}</h1>
            <h2>by ${user.name.text}</h2>
            </div>`
        $('.profile-anims').appendChild(anim)
    }
}