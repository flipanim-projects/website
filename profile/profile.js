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
            id: 'ADMIN'
        }, stats: {
            likes: function () { },
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
        ],
        status: {
            name: "Support has arrived!",
            type: 1 // 0 = invisible, 1 = online, 2 = idle, 3 = dnd
        },
        following: [],
        followers: [],
        password: '' // Hash function (SHA-256, for security)
    }]
}
console.log(users[0].anims[0].author)