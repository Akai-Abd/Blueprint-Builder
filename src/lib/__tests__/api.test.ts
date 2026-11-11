import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));

vi.mock('ai', async () => {
  const actual = await vi.importActual<typeof import('ai')>('ai');
  return {
    ...actual,
    generateText: mockGenerateText,
  };
});

import { POST as chatPOST } from '@/app/api/chat/route';
import { POST as generatePOST } from '@/app/api/generate/route';
import { ApiRequestError, resolveLanguageModel } from '@/lib/aiProvider';
import { createEmptyBlueprint } from '@/types/blueprint';

function makeJsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('AI Provider & API Routes', () => {
  const originalAllowServerKeys = process.env.ALLOW_SERVER_API_KEYS;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ALLOW_SERVER_API_KEYS;
  });

  afterEach(() => {
    if (originalAllowServerKeys === undefined) {
      delete process.env.ALLOW_SERVER_API_KEYS;
    } else {
      process.env.ALLOW_SERVER_API_KEYS = originalAllowServerKeys;
    }
  });

  it('rejects missing client API key unless ALLOW_SERVER_API_KEYS=true', () => {
    expect(() => resolveLanguageModel('google', undefined, '')).toThrow(ApiRequestError);

    try {
      resolveLanguageModel('google', undefined, '');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiRequestError);
      expect((error as ApiRequestError).status).toBe(401);
    }

    expect(() => resolveLanguageModel('invalid-provider', undefined, 'sk-test')).toThrow(
      ApiRequestError,
    );

    process.env.ALLOW_SERVER_API_KEYS = 'true';
    expect(() => resolveLanguageModel('google')).not.toThrow();
  });

  it('validates /api/chat inputs and forwards multi-turn messages to generateText', async () => {
    const bp = createEmptyBlueprint();

    const invalidJsonRes = await chatPOST(makeJsonRequest('http://localhost/api/chat', '{bad'));
    expect(invalidJsonRes.status).toBe(400);

    const noMessagesRes = await chatPOST(
      makeJsonRequest('http://localhost/api/chat', { blueprint: bp, messages: [], apiKey: 'k' }),
    );
    expect(noMessagesRes.status).toBe(400);

    const noKeyRes = await chatPOST(
      makeJsonRequest('http://localhost/api/chat', {
        blueprint: bp,
        messages: [{ role: 'user', content: 'Recommend a database' }],
      }),
    );
    expect(noKeyRes.status).toBe(401);

    mockGenerateText.mockResolvedValueOnce({ text: 'Use PostgreSQL with Prisma.' });

    const okRes = await chatPOST(
      makeJsonRequest('http://localhost/api/chat', {
        blueprint: bp,
        provider: 'openai',
        apiKey: 'sk-user-key',
        messages: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello!' },
          { role: 'user', content: 'What DB should I use?' },
        ],
      }),
    );

    expect(okRes.status).toBe(200);
    await expect(okRes.json()).resolves.toEqual({ text: 'Use PostgreSQL with Prisma.' });
    expect(mockGenerateText).toHaveBeenCalledTimes(1);

    const callArg = mockGenerateText.mock.calls[0][0];
    expect(typeof callArg.instructions).toBe('string');
    expect(callArg.messages).toHaveLength(3);
  });

  it('validates /api/generate inputs and generates markdown cleanly', async () => {
    const bp = createEmptyBlueprint();

    const badBody = await generatePOST(makeJsonRequest('http://localhost/api/generate', { blueprint: bp }));
    expect(badBody.status).toBe(400);

    const noKey = await generatePOST(
      makeJsonRequest('http://localhost/api/generate', {
        blueprint: bp,
        documentTitle: 'PRD',
      }),
    );
    expect(noKey.status).toBe(401);

    mockGenerateText.mockResolvedValueOnce({ text: '# PRD\n\nContent' });

    const okRes = await generatePOST(
      makeJsonRequest('http://localhost/api/generate', {
        blueprint: bp,
        documentTitle: 'PRD',
        documentDescription: 'Product Requirements',
        provider: 'google',
        apiKey: 'gk-user-key',
      }),
    );

    expect(okRes.status).toBe(200);
    await expect(okRes.json()).resolves.toEqual({ text: '# PRD\n\nContent' });
  });
});

