#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { program } from 'commander';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function checkFolder(folder) {
    const packPath = folder ? path.join(folder, 'package-lock.json') : 'package-lock.json';
    if (!fs.existsSync(packPath)) {
        console.log(`${packPath} does not exist`);
        return 2;
    }
    const filecontent = fs.readFileSync(packPath, { encoding: 'utf-8' });
    if (/"http:\/\/registry\.npmjs\.org[/"']/.test(filecontent)) {
        console.log(`${packPath} is NOT OK. It contains references to http://registry.npmjs.org`);
        console.log('In order to fix this do:');
        console.log('- Delete the package-lock.json file');
        console.log('- Delete the node_modules folder');
        console.log('- Run <npm cache clean --force>');
        console.log('- Run <npm install>');
        return 1;
    }
    console.log(`${packPath} is OK`);
    return 0;
}

program
    .version(JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version)
    .description('Checks the package-lock.json file for http:// links')
    .option('-f, --folder <folder>', 'Folder with package-lock.json file')
    .parse(process.argv);

const options = program.opts();
if (options.folder) {
    if (!fs.existsSync(options.folder)) {
        console.log(`Oops! Folder does not exist: ${options.folder}`);
        process.exitCode = 3;
    } else if (!fs.statSync(options.folder).isDirectory()) {
        console.log(`Oops! Folder is not a real folder: ${options.folder}`);
        process.exitCode = 4;
    } else {
        process.exitCode = checkFolder(options.folder);
    }
} else {
    process.exitCode = checkFolder();
}
