module.exports = class APIRefference{
    constructor(){
        class Method{
            constructor(iface, method){
                return new Proxy(data => {
                    return new Promise((resolve, reject) => {
                        var xhr = new XMLHttpRequest;
                        xhr.open('POST', `https://api.allbooms.com/${iface}.${method}`, true);
                        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                        xhr.onreadystatechange = () => {
                            if (xhr.readyState != 4) return;
                            if (xhr.status != 200) reject(new Error(xhr.status + ': ' + xhr.statusText)); else resolve(JSON.parse(xhr.responseText))
                        };
                        xhr.send(JSON.stringify(data));
                    })
                }, {
                    set(target, name, value){},
                    get(target, name){
                        return target[name] !== undefined ? target[name] : new Method(`${iface}.${method}`, name)
                    }
                })
            }
        }
        return new Proxy({}, {
            set(target, name, value){},
            get(target, iface){
                return new Proxy({}, {
                    set(target, name, value){},
                    get(target, method){
                        return new Method(iface, method)
                    }
                })
            }
        })
    }
}
