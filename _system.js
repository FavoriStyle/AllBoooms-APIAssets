/**
 * @type {_system.DateNormalizator}
 */
exports.normalizeDate = date => {
    return 'вчера'
};
/**
 * @type {_system.AsyncWait}
 */
exports.wait = ms => new Promise(r => setTimeout(r, ms));
/**
 * @type {_system.HTTP}
 */
exports.http = {
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
            xhr.send(data);
        })
    }
};
/**
 * @type {_system.Cookies}
 */
var Cookies = {
    get: name => {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    set: (name, value, options) => {
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
        document.cookie = updatedCookie;
    },
    del: name => {
        Cookies.set(name, "", {
            expires: -1
        })
    }
}
exports.Cookies = Cookies;

const LinkInternalElement = Symbol('LinkInternalElement'),
    LinkInternalParams = Symbol('LinkInternalParams');
/**
 * @type {_system.Link}
 */
exports.Link = class Link{
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
            _ = _.split('=');
            this[LinkInternalParams][decodeURIComponent(_[0])] = decodeURIComponent(_[1]);
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
            search += '&' + encodeURIComponent(i) + '=' + encodeURIComponent(params[i])
        }
        this[LinkInternalElement].search = '?' + search.slice(1);
    }
}
exports.ExtString = class ExtString extends String{
    reverse(){
        var newString = "";
        for (var i = this.length - 1; i >= 0; i--) {
            newString += this[i];
        }
        return new ExtString(newString);
    }
};
