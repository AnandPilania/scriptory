import axios from 'axios';
import { spawn } from 'child_process';

const GITHUB_REPO = 'anandpilania/scriptory';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export async function checkForUpdates(verbose = false) {
    try {
        const response = await axios.get(GITHUB_API);
        const latestVersion = response.data.tag_name.replace('v', '');
        const currentVersion = '0.1.8';

        if (verbose) {
            console.log(`Current version: ${currentVersion}`);
            console.log(`Latest version: ${latestVersion}`);
        }

        return compareVersions(latestVersion, currentVersion) > 0;
    } catch (error) {
        if (verbose) {
            console.error('Error checking for updates:', error.message);
        }
        return false;
    }
}

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0;
}

export async function performUpdate() {
    return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['install', '-g', 'scriptory@latest'], {
            stdio: 'inherit',
            shell: true
        });

        npm.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Update failed with code ${code}`));
            }
        });
    });
}
