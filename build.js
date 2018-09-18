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
        console.error('uglify.minify(...).code is not defined properly\n');
        throw new TypeError(minified.error)
    }
    fs.writeFileSync(fname + '.min.js', minified.code, 'utf8');
    // support for top-level await in https://github.com/KaMeHb-UA/require
    fs.writeFileSync('comments/widget.min.js', ";try{let b=await exports.default;module.exports=b}catch(b){console.warn('Looks like \"await\" cannot be used at the top level of the module. Defaulted export to ES module')}console.log('Exported',module.exports);console.groupEnd();", {
        encoding: 'utf8',
        flag: 'a'
    })
    console.log(`Ok`);
});
