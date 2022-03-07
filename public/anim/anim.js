const $ = function (id) { return document.querySelector(id) }
let query = document.location.search.replace('?', '').split('=')[1]
document.querySelector('title').innerHTML = query

let anim
fetch('/api/v1/anims/?id=' + query).then(
    resp => resp.json().then(fin => {
        anim = fin; loadAnim(fin);
    }).catch(err => {
        animNotFound()
        console.error(err)
    })
)

function loadAnim(data) {
    function html(el, text) {
        el.innerHTML = text
        return el.classList.remove('skeleton')
    }
    html($('.anim-title'), data.name)
    html($('.anim-likes'), `<b>${data.stats.likes}</b> like${data.stats.likes === 1 ? '' : 's'}`)
    html($('.anim-views'), `<b>${data.stats.views}</b> view${data.stats.views === 1 ? '' : 's'}`)
    html($('.anim-author'), `by <b>${data.author.text}</b>`)
    html($('.anim-creation'), data.creation.text)
    html($('.anim-comment-count'), '(' + data.comments.length + ')')
    html($('.anim-comment-container'), loadComments(data))
}

function animNotFound() {
    $('.anim-main').innerHTML = `<h1>Anim not found</h1>`
}

function loadComments(data) {
    let res = ``
    for (let i = 0; i < data.comments.length; i++) {
        res += `<div class="anim-comment">
        <img src="/imgs/profile.png">
        <div class="flex flex-col">
            <div class="anim-comment-header">${data.comments[i].author.text}</div>
            <div class="anim-comment-body">${data.comments[i].content}</div>
        </div>
        </div>`
    }
    return res
}
