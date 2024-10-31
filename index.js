#!/usr/bin/env node

'use strict';

import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import { fileURLToPath } from 'url';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check a folder.
 * @return {number}
 */
function checkFolder() {
    let fullpath = '';
    if (options.folder) {
        fullpath = options.folder + path.sep;
    }
    const pack = fullpath + 'package-lock.json';
    if (fs.existsSync(pack)) {
        const filecontent = fs.readFileSync(pack, { encoding: 'utf-8' });
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
        console.log(pack + ' does not exist');
        return 2;
    }
}

program
    .version(JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version)
    .description('Checks the package-lock.json file for http:// links')
    .option('-f, --folder <folder>', 'Folder with package-lock.json file')
    .parse(process.argv);

const options = program.opts();
if (options.folder) {
    if (fs.existsSync(options.folder)) {
        const stats = fs.statSync(options.folder);
        if (stats.isDirectory()) {
            const err = checkFolder();
            process.exitCode = err;
        } else {
            console.log('Oops! Folder is not a real folder: ' + options.folder);
            process.exitCode = 4;
        }
    } else {
        console.log('Oops! Folder does not exist: ' + options.folder);
        process.exitCode = 3;
    }
} else {
    const err = checkFolder();
    process.exitCode = err;
}
