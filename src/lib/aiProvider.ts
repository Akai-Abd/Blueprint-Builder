import { createAnthropic } from '@ai-sdk/anthropic';
import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { MODELS_BY_PROVIDER, type LLMProvider } from '@/lib/aiModels';

type ProviderFactory = (options?: { apiKey?: string }) => (modelId: string) => LanguageModel;

const PROVIDER_FACTORIES: Record<LLMProvider, ProviderFactory> = {
  google: createGoogleGenerativeAI,
  openai: createOpenAI,
  anthropic: createAnthropic,
  mistral: createMistral,
  groq: createGroq,
  cohere: createCohere,
};

/** Request-level validation/auth error for AI API endpoints. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function isLLMProvider(value: unknown): value is LLMProvider {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PROVIDER_FACTORIES, value);
}

/**
 * Resolve an AI SDK LanguageModel from provider, modelId, and optional client API key.
 * Server environment keys are only used when ALLOW_SERVER_API_KEYS=true.
 */
export function resolveLanguageModel(
  providerInput: unknown = 'google',
  modelIdInput?: unknown,
  apiKeyInput?: unknown,
): LanguageModel {
  let provider: LLMProvider = 'google';
  if (providerInput !== undefined && providerInput !== null && providerInput !== '') {
    if (!isLLMProvider(providerInput)) {
      throw new ApiRequestError('Unsupported AI provider', 400);
    }
    provider = providerInput;
  }

  const apiKey = typeof apiKeyInput === 'string' ? apiKeyInput.trim() : '';
  const allowServerKeys = process.env.ALLOW_SERVER_API_KEYS === 'true';

  if (!apiKey && !allowServerKeys) {
    throw new ApiRequestError(
      'API key is required. Provide a key in the UI or set ALLOW_SERVER_API_KEYS=true on the server.',
      401,
    );
  }

  const defaultModel = MODELS_BY_PROVIDER[provider][0].id;
  const modelId =
    typeof modelIdInput === 'string' && modelIdInput.trim() ? modelIdInput.trim() : defaultModel;

  const client = PROVIDER_FACTORIES[provider](apiKey ? { apiKey } : undefined);
  return client(modelId);
}

