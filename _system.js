/**
 * @type {DateNormalizator}
 */
exports.normalizeDate = date => {
    return 'вчера'
};
/**
 * @type {AsyncWait}
 */
exports.wait = ms => new Promise(r => setTimeout(r, ms));
/**
 * @type {HTTP}
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
