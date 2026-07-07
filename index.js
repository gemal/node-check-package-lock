#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { program } from 'commander';

const LOCK_FILES = ['package-lock.json', 'npm-shrinkwrap.json'];

function collectIssues(node, name, issues) {
    if (node === null || typeof node !== 'object') {
        return;
    }
    if (Array.isArray(node)) {
        for (const item of node) {
            collectIssues(item, name, issues);
        }
        return;
    }
    if (typeof node.resolved === 'string') {
        const entry = `${name || '<root>'}: ${node.resolved}`;
        if (/^http:\/\//i.test(node.resolved)) {
            issues.insecure.push(entry);
        } else if (/^https:\/\//i.test(node.resolved) && !node.integrity && !node.inBundle && !node.bundled) {
            issues.missingIntegrity.push(entry);
        }
    }
    for (const [key, value] of Object.entries(node)) {
        collectIssues(value, key, issues);
    }
}

function checkFile(filePath) {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
    } catch (err) {
        console.log(`${filePath} could not be read as JSON: ${err.message}`);
        return 5;
    }
    const issues = { insecure: [], missingIntegrity: [] };
    collectIssues(data, '', issues);
    if (issues.insecure.length === 0 && issues.missingIntegrity.length === 0) {
        console.log(`${filePath} is OK`);
        return 0;
    }
    console.log(`${filePath} is NOT OK.`);
    if (issues.insecure.length > 0) {
        console.log(`It contains ${issues.insecure.length} insecure http:// link(s):`);
        for (const issue of issues.insecure) {
            console.log(`- ${issue}`);
        }
        console.log('In order to fix this do:');
        console.log(`- Delete the ${path.basename(filePath)} file`);
        console.log('- Delete the node_modules folder');
        console.log('- Run <npm cache clean --force>');
        console.log('- Run <npm install>');
    }
    if (issues.missingIntegrity.length > 0) {
        console.log(`It contains ${issues.missingIntegrity.length} download link(s) without an integrity checksum:`);
        for (const issue of issues.missingIntegrity) {
            console.log(`- ${issue}`);
        }
        console.log('Run <npm install> with a current npm version to regenerate the integrity checksums');
    }
    return 1;
}

function checkFolder(folder) {
    const files = LOCK_FILES
        .map((file) => (folder ? path.join(folder, file) : file))
        .filter((file) => fs.existsSync(file));
    if (files.length === 0) {
        const packPath = folder ? path.join(folder, 'package-lock.json') : 'package-lock.json';
        console.log(`${packPath} does not exist`);
        return 2;
    }
    return files.reduce((code, file) => Math.max(code, checkFile(file)), 0);
}

program
    .version(JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'package.json'))).version)
    .description('Checks the package-lock.json file for insecure http:// links and missing integrity checksums')
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
