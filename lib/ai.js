import axios from 'axios'

const CLAUDE_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

/**
 * Generate documentation from staged files using Claude.
 * @param {Array<{path: string, content: string}>} files
 * @param {string} apiKey
 * @param {string} [instruction] - optional extra instruction from user
 */
export async function generateDocumentation(files, apiKey, instruction = '') {
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set in settings')
    if (!files.length) throw new Error('No files selected')

    const filesBlock = files
        .map(f => `### \`${f.path}\`\n\`\`\`${ext(f.path)}\n${f.content}\n\`\`\``)
        .join('\n\n')

    const userInstruction = instruction
        ? `\n\nAdditional context from the developer: ${instruction}`
        : ''

    const prompt = `You are a senior developer writing internal documentation. Given the following staged code files, produce clear, comprehensive Markdown documentation.

Structure your output as:

## Overview
What these changes do and why.

## Changed Files
For each file: what it does, key changes, important logic.

## API / Interface
New or changed functions, props, endpoints, types. Include signatures.

## Usage Examples
Concrete code snippets showing how to use the key new functionality.

## Notes
Anything reviewers or future developers should know.

---

${filesBlock}${userInstruction}

Return ONLY the Markdown documentation. No preamble, no "here is the documentation" wrapper.`

    const response = await axios.post(
        CLAUDE_API,
        {
            model: MODEL,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        },
        {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            timeout: 60_000,
        }
    )

    const textBlock = response.data.content.find(b => b.type === 'text')
    if (!textBlock) throw new Error('Empty response from Claude')
    return textBlock.text
}

function ext(filepath) {
    const e = filepath.split('.').pop()
    const map = {
        js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
        py: 'python', go: 'go', rs: 'rust', java: 'java', cpp: 'cpp',
        c: 'c', sh: 'bash', json: 'json', yaml: 'yaml', yml: 'yaml',
        css: 'css', html: 'html', md: 'markdown',
    }
    return map[e] || e
}
