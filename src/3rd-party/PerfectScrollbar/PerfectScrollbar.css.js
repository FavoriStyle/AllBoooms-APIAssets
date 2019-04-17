function dir(file){
    var res = file.split('/');
    res.pop();
    return res.join('/')
}

export default fetch(dir(import.meta.url) + '/PerfectScrollbar.css').then(v => v.text())
