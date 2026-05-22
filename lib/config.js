import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'scriptory');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export const CONFIG_DEFAULTS = {
    DEEPLINK_PREFIX: '',
    THEME: 'system',       // 'light' | 'dark' | 'system'
    TEAM_NAME: '',
    DOCS_DIR: '',          // empty = use process.cwd()/scriptory
    AUTO_SAVE_INTERVAL: 30, // seconds, 0 = disabled
    initialized: false,
};

export const VALID_CONFIG_KEYS = Object.keys(CONFIG_DEFAULTS).filter(k => k !== 'initialized');

export async function ensureConfigDir() {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch (error) {
        // Already exists — not an error
    }
}

export async function getConfig() {
    try {
        await ensureConfigDir();
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        const stored = JSON.parse(data);
        // Merge with defaults so new keys are always present
        return { ...CONFIG_DEFAULTS, ...stored };
    } catch {
        return { ...CONFIG_DEFAULTS };
    }
}

export async function saveConfig(config) {
    await ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function setConfig(key, value) {
    if (!VALID_CONFIG_KEYS.includes(key)) {
        throw new Error(`Unknown config key: ${key}. Valid keys: ${VALID_CONFIG_KEYS.join(', ')}`);
    }
    const config = await getConfig();
    // Coerce types
    if (key === 'AUTO_SAVE_INTERVAL') {
        config[key] = parseInt(value, 10) || 0;
    } else {
        config[key] = value;
    }
    await saveConfig(config);
    return config;
}

/** Resolve the actual docs directory for this session */
export async function getDocsDir() {
    const config = await getConfig();
    if (config.DOCS_DIR) return config.DOCS_DIR;
    return path.join(process.cwd(), 'scriptory');
}
