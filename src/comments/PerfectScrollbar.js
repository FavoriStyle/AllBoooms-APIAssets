const psHref = 'https://cdn.jsdelivr.net/gh/utatti/perfect-scrollbar@1.4/'
import { createElement } from '../internal/_system.js'
const PerfectScrollbar = import(psHref + 'dist/perfect-scrollbar.esm.min.js').then(({ default: _ }) => _);
const PerfectScrollbarStyle = fetch(psHref + 'css/perfect-scrollbar.min.css').then(v => v.text());
const additionalStyles = '.ps__rail-y{left:unset !important}'


export default class {
    constructor(element, options = {}){
        const root = options.root || document.head;
        delete options.root;
        return Promise.all([PerfectScrollbar, PerfectScrollbarStyle]).then(([PerfectScrollbar, PerfectScrollbarStyle]) => {
            if(!root.querySelector('style[data-perfectscrollbar]')){
                root.appendChild(createElement({
                    name: 'style',
                    html: PerfectScrollbarStyle + '\n' + additionalStyles,
                    attrs: {
                        'data-perfectscrollbar': '',
                    }
                }))
            }
            return new PerfectScrollbar(element, options)
        })
    }
}
