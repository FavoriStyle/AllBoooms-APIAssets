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

function directoryLister(dir){
    readdir(dir, {
        encoding: 'utf8',
        withFileTypes: true,
    }).forEach(dirent => {
        const direntPath = path.resolve(dir, dirent.name);
        if(dirent.isDirectory()) directoryLister(direntPath);
        else if(dirent.isFile() && path.extname(direntPath) === '.js'){
            const filePath = path.relative(srcDir, direntPath);
            process.stdout.write(`Minifying ${filePath}... `);
            const minified = uglify.minify(readFile(direntPath, 'utf8'));
            if(!minified.code) throw new Error(minified.error);
            const destination = path.resolve(distDir, filePath);
            mkdir(path.resolve(destination, '..'));
            writeFile(destination, minified.code, 'utf8');
            console.log('Ok')
        }
    })
}

directoryLister(srcDir);
