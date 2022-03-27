// Welcome
// enter in your details into one of the spaces below
const team = [
    {
        name: "pr",
        username: "pineapplerind",
        role: "Coder",
        image: false,
        link: "https://pineapplerind.ga"
    }, {
        name: "", // Fill this in with your name / display name
        username: "", // Your FAv2 username
        role: "", // Role in the project
        image: "", // Image. Can be a url, or just put false for no image, like I did above
        link: "" // Link to your FAv2 profile OR website
    }, {
        name: "", // Fill this in with your name / display name
        username: "", // Your FAv2 username
        role: "", // Role in the project
        image: "", // Image. Can be a url, or just put false for no image, like I did above
        link: "" // Link to your FAv2 profile OR website
    }, {
        name: "", // Fill this in with your name / display name
        username: "", // Your FAv2 username
        role: "", // Role in the project
        image: "", // Image. Can be a url, or just put false for no image, like I did above
        link: "" // Link to your FAv2 profile OR website
    }
]

/************************************
 * Beyond this point is actual code *
 ***********************************/
let i = 0
do {
    let card = document.createElement('DIV')
    card.innerHTML = `
    <img src="${team[i].image ? team[i].image : '/public/imgs/profile.png'}">
    <div>
        <h2>${team[i].name} <span>@${team[i].username}</span></h2>
        <p><b>${team[i].role}</b></p>
    </div>`
    card.classList.add('team-card')
    if (team[i].link) card.onclick = () => {
        window.open(team[i].link, '_blank').focus();
    }
    document.getElementById('teamMembers').appendChild(card)
    i++
} while (i < team.length)