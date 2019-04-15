import { createElement, waitForProp } from '../_system.js'
/** @type {Object<string, Promise<Element>>} */
const importCache = {};
const defaultWH = 16.933;

function pathToIcon({ default: path, width, height }){
    return createElement({
        name: 'svg',
        attrs: {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: `0 0 ${width || defaultWH} ${height || defaultWH}`,
            style: 'height: 1em; fill: currentColor',
        },
        childs: [{
            name: 'path',
            attrs: {
                d: path,
            },
        }],
    })
}

/** @type {Map<AllboomsBrandIcon, ShadowRoot>} */
const roots = new Map;
const Free = Symbol();
const SetIcon = Symbol();

class AllboomsBrandIcon extends HTMLElement{
    constructor(){
        super();
        const root = this.attachShadow({mode: 'closed'});
        roots.set(this, root);
        const iconName = this.getAttribute('data-name');
        this[Free] = true;
        this[SetIcon](iconName);
    }
    async [SetIcon](name){
        await waitForProp(this, Free);
        delete this[Free];
        const root = roots.get(this);
        root.innerHTML = '';
        if(!importCache[name]) importCache[name] = import('./' + name + '.js').then(p => pathToIcon(p));
        root.appendChild(await importCache[name]);
        this[Free] = true
    }
    attributeChangedCallback(name, oldValue, newValue){
        if(name === 'data-name') this[SetIcon](newValue)
    }
}
customElements.define('allbooms-icon', AllboomsBrandIcon);
export default class {
    constructor(name){
        return createElement({
            name: 'allbooms-icon',
            attrs: {
                'data-name': name,
            },
        })
    }
}
