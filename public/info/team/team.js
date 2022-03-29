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
        name: "Speez", // Fill this in with your name / display name
        username: "speez69", // Your FAv2 username
        role: "Admin & Miscellaneous Helper", // Role in the project
        image: false, // Will fill in later
        link: "/profile?user=_a053c" // Will fill in later
    }, {
        name: "PichuTheCreeper", // Fill this in with your name / display name
        username: "thepichu", // Your FAv2 username
        role: "Admin, Designer", // Role in the project
        image: "https://im5.ezgif.com/tmp/ezgif-5-d4a45560d2-gif-im/frame_00_delay-0.08s.gif", // Will fill in later
        link: "https://flipanimv2publicbeta.herokuapp.com/profile?user=d723b-" // my profile page doesnt work lmao
    }, {
        name: "MatthewMason", // Fill this in with your name / display name
        username: "matthewmason", // Your FAv2 username
        role: "Admin, Designer, Manager", // Role in the project
        image: false, // Image. Can be a url, or just put false for no image, like I did above
        link: "false" // Link to your FAv2 profile OR website
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
    
    if (team[i].link) {
        let r = i
        card.onclick = () => {
            window.open(team[r].link, '_blank').focus();
        }
    }
    document.getElementById('teamMembers').appendChild(card)
    i++
} while (i < team.length)
