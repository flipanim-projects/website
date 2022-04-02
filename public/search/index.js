function FlipAnimSearch(user) {
    window.searchType = 'users'
    const $ = id => { return document.querySelector(id) }
    function toast(t, d, du) {
        new Toast({
            title: t,
            description: d,
            duration: du
        }).init().show()
    }
    function search(query) {
        $('#searchButton').classList.add('submitting')
        fetch('/api/v1/search/'+ window.searchType +'?q=' + query, {
            method: 'GET',
        }).then(resp => {
            resp.json().then(res => {
                $('#searchButton').classList.remove('submitting')
                if (res.status == 400) {
                    // If it's shorter than 3 characters OR longer than 20 characters
                    return toast('Invalid query', 'Please fill out the search query to at least 3 characters and to at most 20 characters', 5)
                } else if (res.status == 200) {
                    let users = res.data
                    populateResults(users)
                } else if (res.status == 429) {
                    return toast('Too many requests', 'Please try again later, you are being ratelimited')
                } else if (res.status == 204) {
                    return toast('No results', 'No results found for your query', 5)
                } else {
                    return toast('Unknown error', 'Please try again later', 5)
                }
            })
        })
    }
    function populateResults(users) {
        for (let i = 0; i < users.length; i++) {
            $('#result').innerHTML += `
            <div class="search-result-user">
            <img src="${users[i].avatar}" alt="${users[i].display}'s avatar" class="avatar">
            <div class="info">
                <div class="name">${users[i].display}</div>
                <div class="username">@${users[i].username}</div>
            </div>
            <div class="actions">
                <a href="/profile?user=${users[i].id}"><button class="proceed">View profile</button></a>
            </div>
        </div>`
        }
        return res.status(200).json({
            status: 200,
            message: '200 OK',
            data: tosend
        });
    }

    $('#searchButton').addEventListener('click', () => {
        let query = $('#searchInput').value
        if (query.length < 3 || query.length > 20) {
            return toast('Invalid query', 'Please fill out the search query to at least 3 characters and to at most 20 characters', 5)
        }
        $('#result').innerHTML = ''
        search(query)
    })

}
loggedIn = loggedIn ? loggedIn : false;
FlipAnimSearch(loggedIn)