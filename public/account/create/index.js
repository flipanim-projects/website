const $ = function (id) {
  return document.querySelector(id);
};
let query = document.location.search.replace('?', '').split('=')[1]
if (query === '1') {
  $('#error').innerHTML = 'Invalid captcha'
}

let usernameRequirements = [
  function (str) {
    if (!str) return 'Username cannot be empty';
    else return false
  },
  function (str) {
    if (str.length < 20 && str.length > 3) return false;
    else return "Username length is not in the range 3-20";
  },
  function (str) {
    let whitelist = `qwertyuiopasdfghjklzxcvbnm1234567890-_!#^*()'~.`;
    for (let i = 0; i < str.length; i++) {
      let validCharacter = true; 
      for (let j = 0; j < whitelist.length; j++) {
        if (str[i].toLowerCase() === whitelist[j]) break;
        if (j === whitelist.length - 1) validCharacter = str[i];
      }
      if (validCharacter !== true)
      return "Invalid character " + validCharacter;
    }  
    let reserved = ["LatticedDreams", "VideoGameDude", "Corruptandco", "Sharkiiie", "Flippy", "Ilysmfromm", "DanePerson", "Deku-Kun2", "Infinity999", "GearyOGuy", "Starshifter", "Worthings", "Worthlessness", "gafrield", "ViViHelico", "one", "FluffyGraffes", "Bugtoast", "Fazerlazer321", "Ak.", "jay", "Thatwaffle99", "wafels", "Its_Dev3230", "Infienthusiastowo", "catarie", "Queen-PufPuf", "Link", "the-dumb-dino", "Bakedbeano", "Poyo"]
    for (let i = 0; i < reserved.length; i++) {
      if (str.toLowerCase().includes(reserved[i].toLowerCase())) return 'Username is reserved'
    }
    return false;
  },
];

function checkUsername(username) {
  for (let i = 0; i < usernameRequirements.length; i++) {
    let check = usernameRequirements[i](username);
    if (check !== false) return check;
  }
  return false;
}

$("#username").oninput = (e) => {
  let check = checkUsername(e.target.value);
  console.log(check)
  if (check == false) return $("#username-container").classList.add('tooltip-hidden');
  else {
    $("#username-container").classList.remove('tooltip-hidden')
    setTimeout(function () {
      $("#username-container").setAttribute("tooltip", check);
    }, 300);
  }
};