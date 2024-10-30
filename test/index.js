import { expect } from 'chai';
import path from 'path';
import { exec } from "node:child_process";
import { fileURLToPath } from 'url';

// Define __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('index.js', function() {
    this.timeout(8000);

    function runTest(args, expectedExitCode, expectedOutput, done) {
        const command = `node ${path.join(__dirname, '../index.js')} ${args.join(' ')}`;
        exec(command, { cwd: path.join(__dirname, '../') }, (error, stdout, stderr) => {
            if (error) {
                expect(error.code).to.equal(expectedExitCode);
            } else {
                expect(stdout).to.match(expectedOutput);
            }
            done();
        });
    }

    it('should exit 1 having problems', function(done) {
        runTest(['--folder', 'test/test1'], 1, /package-lock.json is NOT OK/, done);
    });

    it('should exit 0 having no problems', function(done) {
        runTest(['--folder', 'test/test2'], 0, /package-lock.json is OK/, done);
    });

    it('should exit 0 having no problems with slash', function(done) {
        runTest(['--folder', 'test/test2/'], 0, /package-lock.json is OK/, done);
    });

    it('should exit 0 having no problems without folder', function(done) {
        runTest([], 0, /package-lock.json is OK/, done);
    });

    it('should exit 1 having problems', function(done) {
        runTest(['--folder', 'test/test3'], 1, /package-lock.json is NOT OK/, done);
    });

    it('should exit 1 having problems with no file', function(done) {
        runTest(['--folder', 'test'], 2, /package-lock.json does not exists/, done);
    });

    it('should exit 3 if folder does not exist', function(done) {
        runTest(['--folder', '404'], 3, /Oops! Folder does not exists: 404\n/, done);
    });

    it('should exit 4 if folder is not a folder', function(done) {
        runTest(['--folder', 'test/index.js'], 4, /Oops! Folder is not a real folder: test\/index.js\n/, done);
    });
});
