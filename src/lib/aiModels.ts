export const MODELS_BY_PROVIDER: Record<string, { id: string; label: string }[]> = {
  google: [
    { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
    { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { id: 'gemini-flash-latest', label: 'Gemini Flash Latest' },
    { id: 'gemini-pro-latest', label: 'Gemini Pro Latest' },
  ],
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  ],
  anthropic: [
    { id: 'claude-4-6-sonnet-latest', label: 'Claude 4.6 Sonnet' },
    { id: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
  ],
  mistral: [
    { id: 'mistral-large-latest', label: 'Mistral Large' },
    { id: 'mistral-small-latest', label: 'Mistral Small' },
  ],
  groq: [
    { id: 'llama-3-70b-versatile', label: 'LLaMA 3 70B' },
    { id: 'llama3-8b-8192', label: 'LLaMA 3 8B' },
  ],
  cohere: [
    { id: 'command-r-plus', label: 'Command R+' },
    { id: 'command-r', label: 'Command R' },
  ],
};
