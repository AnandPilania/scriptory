import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'scriptory');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export async function ensureConfigDir() {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating config directory:', error);
    }
}

export async function getConfig() {
    try {
        await ensureConfigDir();
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { DEEPLINK_PREFIX: '', initialized: false };
    }
}

export async function saveConfig(config) {
    await ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function setConfig(key, value) {
    const config = await getConfig();
    config[key] = value;
    await saveConfig(config);
    return config;
}
