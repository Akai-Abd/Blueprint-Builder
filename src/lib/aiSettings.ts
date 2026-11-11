import {
  LLM_PROVIDERS,
  MODELS_BY_PROVIDER,
  type LLMProvider,
} from '@/lib/aiModels';

export { LLM_PROVIDERS, MODELS_BY_PROVIDER, type LLMProvider };

export interface AISettings {
  provider: LLMProvider;
  modelId: string;
  apiKey: string;
}

export const PROVIDER_LABELS: Record<LLMProvider, string> = {
  google: 'Google (Gemini)',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  mistral: 'Mistral',
  groq: 'Groq',
  cohere: 'Cohere',
};

const PROVIDER_STORAGE_KEY = 'blueprint_llm_provider';
const AI_SETTINGS_EVENT = 'bb-ai-settings-changed';

function modelStorageKey(provider: LLMProvider): string {
  return `blueprint_${provider}_model`;
}

function apiKeyStorageKey(provider: LLMProvider): string {
  return `blueprint_${provider}_api_key`;
}

function resolveModelId(provider: LLMProvider): string {
  const models = MODELS_BY_PROVIDER[provider];
  if (typeof window === 'undefined') return models[0].id;
  const saved = localStorage.getItem(modelStorageKey(provider));
  if (saved && models.some((m) => m.id === saved)) {
    return saved;
  }
  return models[0].id;
}

/** Read the active BYOK provider, model, and API key from localStorage. */
export function readAISettings(): AISettings {
  if (typeof window === 'undefined') {
    return {
      provider: 'google',
      modelId: MODELS_BY_PROVIDER.google[0].id,
      apiKey: '',
    };
  }

  const savedProvider = localStorage.getItem(PROVIDER_STORAGE_KEY);
  const provider: LLMProvider =
    savedProvider && (LLM_PROVIDERS as readonly string[]).includes(savedProvider)
      ? (savedProvider as LLMProvider)
      : 'google';

  return {
    provider,
    modelId: resolveModelId(provider),
    apiKey: localStorage.getItem(apiKeyStorageKey(provider)) || '',
  };
}

function notifySettingsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AI_SETTINGS_EVENT));
  }
}

/** Switch active provider and return the resulting settings for that provider. */
export function saveProvider(provider: LLMProvider): AISettings {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
  }
  notifySettingsChanged();
  return readAISettings();
}

/** Persist model selection for the given provider and return updated settings. */
export function saveModelId(provider: LLMProvider, modelId: string): AISettings {
  if (typeof window !== 'undefined') {
    localStorage.setItem(modelStorageKey(provider), modelId);
  }
  notifySettingsChanged();
  return readAISettings();
}

/** Persist API key for the given provider and return updated settings. */
export function saveApiKey(provider: LLMProvider, apiKey: string): AISettings {
  if (typeof window !== 'undefined') {
    if (apiKey) {
      localStorage.setItem(apiKeyStorageKey(provider), apiKey);
    } else {
      localStorage.removeItem(apiKeyStorageKey(provider));
    }
  }
  notifySettingsChanged();
  return readAISettings();
}

/** Whether a non-empty API key is configured for the active provider. */
export function hasConfiguredApiKey(settings: AISettings): boolean {
  return settings.apiKey.trim().length > 0;
}

/** Subscribe to cross-component AI settings changes. */
export function subscribeAISettings(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AI_SETTINGS_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(AI_SETTINGS_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

