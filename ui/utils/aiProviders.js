// Frontend-safe provider definitions (no secrets)
export const PROVIDERS = {
    openai: {
        label: 'OpenAI',
        emoji: '🤖',
        baseUrl: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o',
        needsKey: true,
        note: 'Also works with Together AI, Groq, Fireworks, LM Studio and other OpenAI-compatible APIs.',
    },
    azure: {
        label: 'Azure OpenAI',
        emoji: '☁️',
        baseUrl: '',
        defaultModel: 'gpt-4o',
        needsKey: true,
        note: 'Paste your full Azure deployment endpoint URL below.',
    },
    ollama: {
        label: 'Ollama',
        emoji: '🦙',
        baseUrl: 'http://localhost:11434/v1',
        defaultModel: 'llama3',
        needsKey: false,
        note: 'Runs entirely on your machine. Make sure Ollama is running first.',
    },
    anthropic: {
        label: 'Anthropic',
        emoji: '✦',
        baseUrl: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-sonnet-4-5',
        needsKey: true,
        note: 'Uses the native Anthropic messages API.',
    },
    custom: {
        label: 'Custom',
        emoji: '🔧',
        baseUrl: '',
        defaultModel: '',
        needsKey: false,
        note: 'Any server exposing /v1/chat/completions (OpenAI-compatible format).',
    },
}
