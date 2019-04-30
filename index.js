#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const program = require('commander');

/**
 * Check a folder.
 * @return {number}
 */
function checkFolder() {
    let fullpath = '';
    if (program.folder) {
        fullpath = program.folder + path.sep;
    }
    const pack = fullpath + 'package-lock.json';
    if (fs.existsSync(pack)) {
        const filecontent = fs.readFileSync(pack, {encoding: 'utf-8'});
        if (filecontent.indexOf('http://registry.npmjs.org') > -1) { // lgtm [js/incomplete-url-substring-sanitization]
            console.log(pack + ' is NOT OK. It contains references to http://registry.npmjs.org');
            console.log('In order to fix this do:');
            console.log('- Delete the package-lock.json file');
            console.log('- Delete the node_modules folder');
            console.log('- Run <npm cache clean --force>');
            console.log('- Run <npm install>');
            return 1;
        } else {
            console.log(pack + ' is OK');
            return 0;
        }
    } else {
        console.log(pack + ' does not exists');
        return 2;
    }
}

program
    .version(require('./package.json').version)
    .description('Checks the package-lock.json file for http:// links')
    .option('-f, --folder <folder>', 'Folder with package-lock.json file')
    .parse(process.argv);

if (program.folder) {
    if (fs.existsSync(program.folder)) {
        const stats = fs.statSync(program.folder);
        if (stats.isDirectory()) {
            const err = checkFolder();
            process.exitCode = err;
        } else {
            console.log('Oops! Folder is not a real folder: ' + program.folder);
            process.exitCode = 4;
        }
    } else {
        console.log('Oops! Folder does not exists: ' + program.folder);
        process.exitCode = 3;
    }
} else {
    const err = checkFolder();
    process.exitCode = err;
}
