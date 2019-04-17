import { createElement } from '../../internal/_system.js'
import PerfectScrollbarStyle from './PerfectScrollbar.css.js'
import PerfectScrollbar from './PerfectScrollbar.js'
const additionalStyles = '.ps__rail-y{left:unset !important}'

export default class {
    constructor(element, options = {}){
        const root = options.root || document.head;
        delete options.root;

        PerfectScrollbarStyle.then(style => {
            if(!root.querySelector('style[data-perfectscrollbar]')){
                root.appendChild(createElement({
                    name: 'style',
                    html: style + '\n' + additionalStyles,
                    attrs: { 'data-perfectscrollbar': '' }
                }))
            }
        });

        return new PerfectScrollbar(element, options)
    }
}
