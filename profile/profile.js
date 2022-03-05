let query = document.location.search.replace('?', '')
document.querySelector('title').innerHTML = query
const Users = {
    fetch: function (id) {
        return this.data.findIndex(obj=>{
            return obj.name.id === id
        })
    },
    at: function(ind) {return this.data[ind]},
    remove: function(ind) {
        return this.data.splice(ind,1)
    },
    data: [{
        name: {
            text: 'flipanim',
            id: 'admin'
        }, stats: {
            likes: function () { this.anims.reduce() },
            views: function () { },
        }, anims: [
            {
                name: 'Welcome to New FlipAnim',
                id: 'FIRSTANIM',
                stats: {
                    likes: 1,
                    views: 2
                },
                author: 'ADMIN'
            }
        ], notifications: [
            {
                title: 'Welcome to FlipAnim!',
                description: 'Placeholder text.',
                read: false
            }
        ],
        status: {
            name: "Support has arrived!",
            type: 1 // 0 = invisible, 1 = online, 2 = idle, 3 = dnd
        },
        following: [],
        followers: [],
        password: '', // Hash function (SHA-256, for security)
        bio: `Flipanim's moderator and creator. Feel free to ping for help!`,
        admin: true,
        creation: {
            unix: 1646485900,
            text: '2022-03-05'
        }
    },{
        name: {
            text: 'pineapplerind',
            id: 'pineapplerind'
        }, stats: {
            likes: function () { this.anims.reduce() },
            views: function () { },
        }, anims: [], notifications: [
            {
                title: 'Welcome to FlipAnim!',
                description: 'Placeholder text.',
                read: false
            }
        ],
        status: {
            name: "coding",
            type: 1 // 0 = invisible, 1 = online, 2 = idle, 3 = dnd
        },
        following: [],
        followers: [],
        password: '', // Hash function (SHA-256, for security)
        bio: `Flipanim v2's architect`,
        admin: true,
        creation: {
            unix: 1646486784,
            text: '2022-03-05'
        }
    }]
}


function loadProfile(data) {
    const statuses = {
        "0": 'Invisible',
        "1": 'Online',
        "2": 'Idle',
        "3": 'Do Not Disturb',
    }
    const $ = function(id) {return document.querySelector(id)}
    let user = Users.at(Users.fetch(query.replace('user=','')))
    if (user === undefined) return $('.profile-basic-info').innerHTML = '<h1>User not found</h1>'

    $('.profile-name').innerHTML = '@'+user.name.text 
    if (user.admin === true) {
        let admin = document.createElement('DIV')
        admin.classList.add('admin')
        $('.profile-name').appendChild(admin)
    }
    $('.profile-creation').innerHTML = 'Created ' + user.creation.text
    $('.profile-follow.ers').innerHTML = user.followers.length + ' followers' 
    $('.profile-follow.ing').innerHTML ='Following ' + user.following.length

    $('.profile-bio').innerHTML = user.bio
    $('.profile-status-type').innerHTML = statuses[user.status.type]
    $('.profile-status-type').classList.add(statuses[user.status.type])
    $('.profile-status').innerHTML += ' | '+user.status.name || ' '
}
loadProfile()