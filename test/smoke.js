import { expect } from 'chai';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// runs npm cross-platform: through the npm-cli.js that launched this process
// when available, otherwise through the npm on the PATH
function npm(args, cwd) {
    if (process.env.npm_execpath) {
        return execFileSync(process.execPath, [process.env.npm_execpath, ...args], { cwd, encoding: 'utf-8' });
    }
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    return execFileSync(cmd, args, { cwd, encoding: 'utf-8', shell: process.platform === 'win32' });
}

describe('packaged tarball (smoke test)', function() {
    this.timeout(120000);

    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
    let tmp;
    let installedDir;

    function runInstalledCli(args) {
        return spawnSync(process.execPath, [path.join(installedDir, 'index.js'), ...args], { encoding: 'utf-8' });
    }

    before(function() {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-package-lock-smoke-'));
        npm(['pack', '--pack-destination', tmp], root);
        const tarball = path.join(tmp, `${pkg.name}-${pkg.version}.tgz`);
        fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({
            name: 'smoke-test',
            version: '1.0.0',
            private: true
        }));
        npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], tmp);
        installedDir = path.join(tmp, 'node_modules', pkg.name);
    });

    after(function() {
        if (tmp) {
            fs.rmSync(tmp, { recursive: true, force: true });
        }
    });

    it('should ship index.js in the tarball', function() {
        expect(fs.existsSync(path.join(installedDir, 'index.js'))).to.equal(true);
    });

    it('should expose the check-package-lock bin', function() {
        const bin = process.platform === 'win32' ? 'check-package-lock.cmd' : 'check-package-lock';
        expect(fs.existsSync(path.join(tmp, 'node_modules', '.bin', bin))).to.equal(true);
    });

    it('should report its version when installed', function() {
        const res = runInstalledCli(['--version']);
        expect(res.status).to.equal(0);
        expect(res.stdout.trim()).to.equal(pkg.version);
    });

    it('should exit 0 on a clean lockfile when installed', function() {
        const res = runInstalledCli(['--folder', path.join(root, 'test', 'test2')]);
        expect(res.status).to.equal(0);
        expect(res.stdout).to.match(/is OK/);
    });

    it('should exit 1 on an insecure lockfile when installed', function() {
        const res = runInstalledCli(['--folder', path.join(root, 'test', 'test1')]);
        expect(res.status).to.equal(1);
        expect(res.stdout).to.match(/is NOT OK/);
    });
});
