import axios from 'axios';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version: CURRENT_VERSION } = require('../package.json');

const GITHUB_REPO = 'anandpilania/scriptory';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export async function checkForUpdates(verbose = false) {
    try {
        const response = await axios.get(GITHUB_API, { timeout: 5000 });
        const latestVersion = response.data.tag_name.replace(/^v/, '');

        if (verbose) {
            console.log(`Current version: ${CURRENT_VERSION}`);
            console.log(`Latest version:  ${latestVersion}`);
        }

        return compareVersions(latestVersion, CURRENT_VERSION) > 0;
    } catch {
        if (verbose) {
            console.error('Could not reach GitHub to check for updates.');
        }
        return false;
    }
}

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const a = parts1[i] ?? 0;
        const b = parts2[i] ?? 0;
        if (a > b) return 1;
        if (a < b) return -1;
    }
    return 0;
}

export async function performUpdate() {
    return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['install', '-g', 'scriptory@latest'], {
            stdio: 'inherit',
            shell: true,
        });
        npm.on('close', (code) => {
            code === 0 ? resolve() : reject(new Error(`Update failed with exit code ${code}`));
        });
    });
}

export { CURRENT_VERSION };
