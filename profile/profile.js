let query = document.location.search.replace('?','')
document.querySelector('title').innerHTML = query
const user = {
    name: {
        text: '',
        id: ''
    }, stats: {
        likes: 0,
        views: 0
    },
    following: [],
    followers: [],
    password: '' // Hash function (SHA-256, for security)
}