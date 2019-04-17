import {
    readFileSync as readFile,
    writeFileSync as writeFile,
    readdirSync as readdir,
    mkdirSync,
} from 'fs'
import uglify from 'uglify-es'
import path from 'path'
import rimraf from 'rimraf'

const currentFile = decodeURI(import.meta.url).replace(/^file:\/+/, '/');
const srcDir = path.resolve(currentFile, '..', 'src');
const distDir = path.resolve(srcDir, '..', 'dist');

function mkdir(dir){
    try{
        mkdirSync(dir, { recursive: true })
    } catch(e){
        if(e.code !== 'EEXIST') throw e
    }
}

rimraf.sync(distDir);
mkdir(distDir);

function processFile(fname, processor){
    const filePath = path.relative(srcDir, fname);
    process.stdout.write(`Processing ${filePath}... `);
    const src = readFile(fname, 'utf8');
    const minified = processor ? processor(src) : src;
    const destination = path.resolve(distDir, filePath);
    mkdir(path.resolve(destination, '..'));
    writeFile(destination, minified, 'utf8');
    console.log('Ok')
}

function directoryLister(dir){
    readdir(dir, {
        encoding: 'utf8',
        withFileTypes: true,
    }).forEach(dirent => {
        const direntPath = path.resolve(dir, dirent.name);
        if(dirent.isDirectory()) directoryLister(direntPath);
        else if(dirent.isFile()){
            if(path.extname(direntPath) === '.js'){
                processFile(direntPath, src => {
                    const minified = uglify.minify(src);
                    if(!minified.code) throw new Error(minified.error);
                    return minified.code
                })
            } else if(path.extname(direntPath) === '.css') processFile(direntPath);
        }
    })
}

directoryLister(srcDir);
