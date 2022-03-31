(function FlipAnimBrowse(user) {
    const $ = id => {
        return document.querySelector(id);
    }
    let query = window.location.search;
    if (!query) window.location.search = '?type=popular'
    let type = query.split('=')[1]
    let select = document.getElementsByName('animtype')[0]
    for (let i = 0; i < select.children.length; i++) {
        if (select.children[i].value === type) {
            select.children[i].classList.add('selected')
        }
        select.children[i].onclick = function () {
            window.location.search = `?type=${this.value}`
        }
    }
    fetch(`/api/v1/anims?type=${type}`).then(res => {
        return res.json()
    }).then(anims => {
        let container = $('#anims')
        for (let i = 0; i < anims.length; i++) {
            let anim = anims[i]
            let div = document.createElement('div')
            div.classList.add('anim-thumb')
            
            div.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${anim.name}</h5>
                    <p class="card-text">${anim.description}</p>
                    <a href="/anim?id=${anim._id}" class="btn btn-primary">View</a>
                </div>
            </div>
            `
            container.appendChild(div)
        }
    }).catch(err => {
        console.error(err)
    })
})()