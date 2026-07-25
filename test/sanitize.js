import { expect } from 'chai';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, '..', 'index.js');

// control characters built at runtime so this source file stays plain ASCII
const ESC = String.fromCharCode(27);
const range = (from, to) => String.fromCharCode(from) + '-' + String.fromCharCode(to);
const controlChars = new RegExp('[' + range(0, 8) + range(11, 12) + range(14, 31) + range(127, 159) + ']');

function run(folder) {
    return new Promise(function(resolve) {
        execFile(process.execPath, [indexPath, '--folder', folder], (error, stdout) => {
            resolve({ code: error ? error.code : 0, out: stdout });
        });
    });
}

describe('output sanitizing', function() {
    this.timeout(8000);

    let tmp;

    before(function() {
        // a lockfile whose resolved URL embeds an ANSI escape; the tool prints that
        // untrusted value, so it must be stripped before reaching the terminal
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-package-lock-sanitize-'));
        const lock = {
            packages: {
                'node_modules/evil': {
                    resolved: 'http://evil' + ESC + '[31m.example.com/evil.tgz',
                },
            },
        };
        fs.writeFileSync(path.join(tmp, 'package-lock.json'), JSON.stringify(lock));
    });

    after(function() {
        if (tmp) {
            fs.rmSync(tmp, { recursive: true, force: true });
        }
    });

    it('should not emit control characters from malicious lockfile content', async function() {
        const { code, out } = await run(tmp);
        expect(code).to.equal(1);
        expect(out).to.not.match(controlChars);
    });

    it('should keep the readable part of the sanitized resolved URL', async function() {
        const { out } = await run(tmp);
        expect(out).to.match(/http:\/\/evil\[31m\.example\.com/);
    });
});
