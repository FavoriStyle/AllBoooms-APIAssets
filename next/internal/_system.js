import APIReference from './APIref.js'

const LinkInternalElement = Symbol('LinkInternalElement'),
    LinkInternalParams = Symbol('LinkInternalParams'),
    API = new APIReference;

export function normalizeDate(date){
    return 'вчера'
}

export function wait(ms){
    return new Promise(r => setTimeout(r, ms))
}

export const http = {
    get(url){
        var xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            xhr.open('GET', url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState != 4) return;
                if (xhr.status != 200) reject(new Error(`Cannot get requested url. Error ${xhr.status}: ${xhr.statusText}`)); else resolve(xhr.responseText);
            };
            xhr.send()
        })
    },
    post(url, data, contentType = 'application/x-www-form-urlencoded'){
        var xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.onreadystatechange = () => {
                if (xhr.readyState != 4) return;
                if (xhr.status != 200) reject(new Error(`Cannot post to requested url. Error ${xhr.status}: ${xhr.statusText}`)); else resolve(xhr.responseText);
            };
            xhr.send(data)
        })
    },
}

export const Cookies = {
    get(name){
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined
    },
    set(name, value, options){
        options = options || {};
        var expires = options.expires;
        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }
        value = encodeURIComponent(value);
        var updatedCookie = name + "=" + value;
        for (var propName in options){
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }
        document.cookie = updatedCookie
    },
    del(name){
        Cookies.set(name, "", {
            expires: -1
        })
    },
}

export class Link{
    constructor(url){
        this[LinkInternalElement] = window.document.createElement('a');
        this.href = url;
    }
    get href(){
        return this[LinkInternalElement].href
    }
    set href(url){
        this[LinkInternalElement].href = url;
        this[LinkInternalParams] = {};
        this[LinkInternalElement].search.slice(1).split('&').forEach(_ => {
            if(_ == '') return;
            _ = _.split('=');
            this[LinkInternalParams][decodeURIComponent(_[0])] = decodeURIComponent(_[1] || '');
        });
    }
    get params(){
        var _this = this;
        return new Proxy(this[LinkInternalParams], {
            set(target, name, value){
                target[name] = value;
                _this.params = target;
                return true
            },
            deleteProperty(target, name){
                delete target[name];
                _this.params = target;
                return true
            },
        })
    }
    set params(params){
        var search = '';
        for(var i in params){
            search += '&' + encodeURIComponent(i) + (params[i] ? '=' + encodeURIComponent(params[i]) : '')
        }
        this[LinkInternalElement].search = '?' + search.slice(1);
    }
}

export class ExtString extends String{
    reverse(){
        var newString = "";
        for (var i = this.length - 1; i >= 0; i--) {
            newString += this[i];
        }
        return new ExtString(newString);
    }
}

export function currentFile(){
    const stack = new Error('').stack.split('\n');
    const latest = stack[stack.length - 1] || stack[stack.length - 2];
    const before = latest.split(/:\d+:\d+/)[0];
    var protocol = before.split(':')[0].split(/\W/);
    protocol = protocol[protocol.length - 1] + ':';
    const parts = before.split(protocol);
    parts.shift();
    return protocol + parts.join(protocol)
}

export function currentDir(){
    const fileURI = currentFile();
    if(/^data:/.test(fileURI)) throw new Error('data URIs is not supported');
    const parts = fileURI.split('/');
    parts.pop();
    return parts.join('/')
}

const _createElementChildContext = Object(Symbol());

export function createElement({ name, attrs, html, childs }){
    attrs = attrs || {};
    html = html || '';
    childs = childs || [];
    var _attrs = '';
    for(var i in attrs) _attrs += ` ${i}="${attrs[i]}"`;
    html += childs.map(createElement.bind(_createElementChildContext)).join('');
    const result = `<${name}${_attrs}>${html}</${name}>`;
    if(this === _createElementChildContext) return result;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = result;
    return wrapper.removeChild(wrapper.children[0] || wrapper.childNodes[0])
}
Object.assign(createElement, { src: createElement.bind(_createElementChildContext) });

export function htmlSafeText(text){
    return text.replace('<', '&lt;').replace('>', '&gt;')
}

export function currentUser(){
    return new Promise(resolve => {
        const token = Cookies.get('allbooms_token');
        if(!token) resolve(null); else API.user.getMe({ token }).then(resolve).catch(() => resolve(null))
    })
}

export function currentToken(){
    return Cookies.get('allbooms_token')
}

export function argsEncode(args){
    var res = [];
    for(var i in args) res.push(encodeURIComponent(i) + '=' + encodeURIComponent(args[i]));
    return res.join('&')
}

export function argsDecode(args){
    var res = {};
    args.split('&').forEach(arg => {
        var parts = arg.split('=');
        res[decodeURIComponent(parts.shift())] = decodeURIComponent(parts.join('='))
    });
    return res
}

export const rand = () => Math.random().toString(36).substring(2, 15)

export const setImmediate = (() => {
    var head = {},
        tail = head;
    var ID = Math.random();

    window.addEventListener('message', e => {
        if (e.data != ID) return;
        head = head.next;
        var func = head.func;
        delete head.func;
        func()
    });

    return func => {
        tail = tail.next = {
            func: func
        };
        window.postMessage(ID, "*")
    }
})();

export function waitForProp(obj, prop, ...excludedValues){
    const hasOwnProperty = Object.prototype.hasOwnProperty.bind(obj, prop);
    return new Promise(r => {
        setImmediate(function awaiter(){
            if(hasOwnProperty() && excludedValues.indexOf(obj[prop]) === -1) r(); else setImmediate(awaiter)
        })
    })
}
