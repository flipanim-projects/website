const $ = document.querySelectorAll.bind(document);
let sections = $('.terms-section')
let items = $('.sidebar-item')

for (const item of items) {
    item.onclick = () => {
        console.log('h')
        window.location.hash = item.innerHTML.toLowerCase().replaceAll(' ', '')
    }

}
let prev
let indicator = $('.indicator')[0]
const scrollspy = () => {
    const y =
        document.documentElement.scrollTop || document.body.scrollTop;
    sections.forEach((section) => {
        const sy = section.offsetTop;
        if (y > sy - 200) {
            
            items.forEach((link) => {
                if (link.innerHTML.toLowerCase().replaceAll(' ', '') === section.id) {
                    if (prev) prev.classList.remove('sidebar-item-selected')
                    link.classList.add('sidebar-item-selected')
                    prev = link
                    indicator.style.top = link.offsetTop+1 + 'px';
                    indicator.style.height = link.offsetHeight-2 + 'px';
                }
            });
        }
    });
};
document.addEventListener('scroll', () => scrollspy())