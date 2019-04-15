class Method{
    constructor(iface, method){
        return new Proxy(data => {
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest;
                xhr.open('POST', `https://api.${APIReference.baseHost}/${iface}.${method}`, true);
                xhr.setRequestHeader('Content-type', 'application/json');
                xhr.onreadystatechange = () => {
                    if (xhr.readyState != 4) return;
                    if (xhr.status != 200) reject(new Error(xhr.status + ': ' + xhr.statusText)); else {
                        let result = JSON.parse(xhr.responseText);
                        if(!result.error) resolve(result.result); else reject(new Error(result.error))
                    }
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

class APIReference{
    constructor(){
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
APIReference.baseHost = 'allbooms.com';

export default APIReference
