const flist = [
    '_system',
    'APIref',
    'comments/widget',
];

const options = {};

const fs = require('fs'),
    uglify = require('uglify-es');

flist.forEach(fname => {
    process.stdout.write(`Building ${fname}.min.js...`);
    var minified = uglify.minify(fs.readFileSync(fname + '.js', 'utf8'), options);
    if(!minified.code){
        console.log('uglify.minify(...) = ', minified);
        throw new TypeError('uglify.minify(...).code is not defined properly')
    }
    fs.writeFileSync(fname + '.min.js', minified.code, 'utf8');
    // support for top-level await in https://github.com/KaMeHb-UA/require
    fs.writeFileSync('comments/widget.min.js', "var logs=[];try{let b=await exports.default;module.exports=b}catch(b){logs.push({type:'log',data:['%cLooks like \"await\" cannot be used at the top level of the module. Defaulted export to ES module','background: #332B00; color: #DFC185']})}logs.push({type:'log',data:['Exported',module.exports]}),(()=>{return function b({name:c,childs:d}){try{console.group(c),d.forEach(({type:f,data:g,name:h,childs:i})=>{'log'==f?console.log(...g):'group'==f&&b({name:h,childs:i})}),console.groupEnd()}catch(f){console.warn('Your browser does not support group logging, so it will not be shown to you')}}})()({name:'AllBooms comments widget',childs:logs})", {
        encoding: 'utf8',
        flag: 'a'
    })
    console.log(`Ok`);
});
