if(!document.head.querySelector('style[data-font="Roboto"]')){
    const style = document.createElement('style');
    style.innerHTML = "@import url('https://fonts.googleapis.com/css?family=Roboto&subset=cyrillic,cyrillic-ext');";
    style.setAttribute('data-font', 'Roboto');
    document.head.appendChild(style)
}
