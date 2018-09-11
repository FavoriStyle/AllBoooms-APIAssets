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
/**
 * @type {_system.Link}
 */
exports.Link = {
    addParam(url, key, value){
        var _ = url.split('#'), splitter = '&';
        if(_[0].split('?').length == 1) splitter = '?';
        return `${_[0]}${splitter}${encodeURIComponent(key)}=${encodeURIComponent(value)}${_[1] ? `#${_[1]}` : ''}`;
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
