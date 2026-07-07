import { expect } from 'chai';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('index.js', function() {
    this.timeout(8000);

    function runTest(args, expectedExitCode, expectedOutput, done) {
        const scriptArgs = [path.join(__dirname, '../index.js'), ...args];
        execFile(process.execPath, scriptArgs, { cwd: path.join(__dirname, '../') }, (error, stdout) => {
            const exitCode = error ? error.code : 0;
            expect(exitCode).to.equal(expectedExitCode);
            expect(stdout).to.match(expectedOutput);
            done();
        });
    }

    it('should exit 1 having problems in test1', function(done) {
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

    it('should exit 1 having problems in test3', function(done) {
        runTest(['--folder', 'test/test3'], 1, /package-lock.json is NOT OK/, done);
    });

    it('should exit 1 detecting http links on non-npmjs registries', function(done) {
        runTest(['--folder', 'test/test3'], 1, /http:\/\/registry\.yarnpkg\.com/, done);
    });

    it('should exit 1 on missing integrity checksums in test4', function(done) {
        runTest(['--folder', 'test/test4'], 1, /without an integrity checksum/, done);
    });

    it('should exit 5 on invalid JSON in test5', function(done) {
        runTest(['--folder', 'test/test5'], 5, /could not be read as JSON/, done);
    });

    it('should exit 1 having problems in npm-shrinkwrap.json in test6', function(done) {
        runTest(['--folder', 'test/test6'], 1, /npm-shrinkwrap.json is NOT OK/, done);
    });

    it('should exit 2 having problems with no file', function(done) {
        runTest(['--folder', 'test'], 2, /package-lock.json does not exist/, done);
    });

    it('should exit 3 if folder does not exist', function(done) {
        runTest(['--folder', '404'], 3, /Oops! Folder does not exist: 404/, done);
    });

    it('should exit 4 if folder is not a folder', function(done) {
        runTest(['--folder', 'test/index.js'], 4, /Oops! Folder is not a real folder: test\/index.js/, done);
    });
});
