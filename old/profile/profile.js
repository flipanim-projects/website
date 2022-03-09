let query = document.location.search.replace('?', '')
document.querySelector('title').innerHTML = query.split('=')[1]

fetch('/api/v1/users?'+query).then(
    resp => resp.json() .then(fin => {
            user = fin; loadProfile(fin);
        }).catch(err => {
            profileNotFound()
            console.error(err)
        })
)

let user = {}

const $ = function (id) { return document.querySelector(id) }
function profileNotFound() {
    $('main').innerHTML = `<h1>User not found</h1>
    <p>The profile could not be loaded, sadly</p>
    <a style="cursor:pointer;text-decoration:underline;" onclick="window.history.go(-1)">&larr; Back</a>`
}
function loadProfile(data) {
    function html(el,text){
        el.innerHTML = text
        return el.classList.remove('skeleton')
    }
    const statuses = {
        "0": 'Invisible',
        "1": 'Online',
        "2": 'Idle',
        "3": 'Do Not Disturb',
    }

    if (user === undefined) return $('.profile-basic-info').innerHTML = '<h1>User not found</h1>'

    html($('.profile-name'),'@' + user.name.text)
    if (user.admin === true) {
        let admin = document.createElement('DIV')
        admin.classList.add('admin')
        $('.profile-name').appendChild(admin)
    }
    $(".profile-image").classList.remove('skeleton')
    html($('.profile-creation'),'Created ' + user.creation.text)
    html($('.profile-follow.ers'),user.followers.length + ' followers')
    html($('.profile-follow.ing'),'Following ' + user.following.length)
    html($('.profile-bio'),user.bio)
   // html($('.profile-status-type'),statuses[user.status.type])

    html($('.profile-status'),'<span class="profile-status-type">'+statuses[user.status.type]+'</span> | ' + user.status.name || ' ')
    $('.profile-status-type').classList.add(statuses[user.status.type])

    loadAnims(user.anims,user)
}

function loadAnims(anims,user) {
    for (let i = 0; i < anims.length; i++) {
        let anim = document.createElement('DIV')
        anim.classList.add('anim')
        anim.onclick = () => {
            window.location.href = '../anim/?id='+anims[i].id
        }
        anim.innerHTML += `<div class="anim-text">
            <h1>${anims[i].name}</h1>
            <h2>by ${user.name.text}</h2>
            </div>`
        $('.profile-anims').appendChild(anim)
    }
}