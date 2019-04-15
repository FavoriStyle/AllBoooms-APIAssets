export default (name, src) => {
    if(!document.head.querySelector(`style[data-font="${name}"]`)){
        const style = document.createElement('style');
        style.innerHTML = `@import url('${src}');`;
        style.setAttribute('data-font', name);
        document.head.appendChild(style)
    }
}
