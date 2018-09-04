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
    fs.writeFileSync(fname + '.min.js', uglify.minify(fs.readFileSync(fname + '.js', 'utf8'), options).code, 'utf8');
    console.log(`Ok`);
});
