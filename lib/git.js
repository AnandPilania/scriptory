import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export async function isGitRepo(cwd = process.cwd()) {
    try {
        await execAsync('git rev-parse --is-inside-work-tree', { cwd })
        return true
    } catch {
        return false
    }
}

export async function getStagedFiles(cwd = process.cwd()) {
    try {
        const { stdout } = await execAsync('git diff --staged --name-only', { cwd })
        return stdout.trim().split('\n').filter(Boolean)
    } catch {
        return []
    }
}

export async function getUnstagedFiles(cwd = process.cwd()) {
    try {
        const { stdout } = await execAsync('git diff --name-only', { cwd })
        return stdout.trim().split('\n').filter(Boolean)
    } catch {
        return []
    }
}

export async function getStagedFileContent(filepath, cwd = process.cwd()) {
    try {
        const { stdout } = await execAsync(`git show :${filepath}`, { cwd })
        return stdout
    } catch {
        // Fall back to working copy
        try {
            return await fs.readFile(path.join(cwd, filepath), 'utf8')
        } catch {
            return null
        }
    }
}

export async function getGitStatus(cwd = process.cwd()) {
    const isRepo = await isGitRepo(cwd)
    if (!isRepo) return { isRepo: false, staged: [], unstaged: [] }

    const [staged, unstaged] = await Promise.all([
        getStagedFiles(cwd),
        getUnstagedFiles(cwd),
    ])

    return { isRepo: true, staged, unstaged }
}
