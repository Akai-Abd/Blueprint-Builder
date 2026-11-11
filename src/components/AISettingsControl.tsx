'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LLM_PROVIDERS,
  MODELS_BY_PROVIDER,
  PROVIDER_LABELS,
  hasConfiguredApiKey,
  readAISettings,
  saveApiKey,
  saveModelId,
  saveProvider,
  subscribeAISettings,
  type AISettings,
  type LLMProvider,
} from '@/lib/aiSettings';

/** Keep component state synced with shared BYOK settings in localStorage. */
export function useAISettings(): AISettings {
  const [settings, setSettings] = useState<AISettings>(readAISettings);

  useEffect(() => {
    return subscribeAISettings(() => {
      setSettings(readAISettings());
    });
  }, []);

  return settings;
}

interface AIModeBadgeProps {
  settings: AISettings;
}

/** Explicit indicator showing whether Live AI or Offline Templates are active. */
export function AIModeBadge({ settings }: AIModeBadgeProps) {
  const isLive = hasConfiguredApiKey(settings);
  return (
    <span
      className={`ai-mode-badge ${isLive ? 'ai-mode-badge--live' : 'ai-mode-badge--offline'}`}
      title={
        isLive
          ? `Using ${PROVIDER_LABELS[settings.provider]} (${settings.modelId})`
          : 'No API key saved — using local offline templates'
      }
    >
      {isLive ? `⚡ Live AI · ${PROVIDER_LABELS[settings.provider]}` : '📄 Offline Templates'}
    </span>
  );
}

interface AISettingsControlProps {
  settings: AISettings;
  compact?: boolean;
}

/** Shared BYOK provider, model, and API key inputs used by Assistant and GenerationScreen. */
export default function AISettingsControl({
  settings,
  compact = false,
}: AISettingsControlProps) {
  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    saveProvider(e.target.value as LLMProvider);
  }, []);

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      saveModelId(settings.provider, e.target.value);
    },
    [settings.provider],
  );

  const handleApiKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      saveApiKey(settings.provider, e.target.value);
    },
    [settings.provider],
  );

  const handleClearKey = useCallback(() => {
    saveApiKey(settings.provider, '');
  }, [settings.provider]);

  return (
    <div className={`ai-settings ${compact ? 'ai-settings--compact' : ''}`}>
      <div className="ai-settings__row">
        <select
          className="ai-settings__select"
          value={settings.provider}
          onChange={handleProviderChange}
          aria-label="LLM provider"
        >
          {LLM_PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {PROVIDER_LABELS[p]}
            </option>
          ))}
        </select>

        <select
          className="ai-settings__select"
          value={settings.modelId}
          onChange={handleModelChange}
          aria-label="LLM model"
        >
          {MODELS_BY_PROVIDER[settings.provider].map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ai-settings__key-row">
        <input
          type="password"
          className="ai-settings__input"
          aria-label="Provider API Key"
          placeholder={`Optional: ${PROVIDER_LABELS[settings.provider]} API Key`}
          value={settings.apiKey}
          onChange={handleApiKeyChange}
          autoComplete="off"
        />
        {settings.apiKey && (
          <button
            type="button"
            className="ai-settings__clear"
            onClick={handleClearKey}
            title="Clear API key"
            aria-label="Clear API key"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

