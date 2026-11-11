import { generateText, type ModelMessage } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ApiRequestError, resolveLanguageModel } from '@/lib/aiProvider';

export const maxDuration = 60;

const MAX_HISTORY_MESSAGES = 20;

interface IncomingMessage {
  role?: unknown;
  content?: unknown;
}

function normalizeMessages(raw: unknown): ModelMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new ApiRequestError('Missing required parameters', 400);
  }

  const normalized: ModelMessage[] = [];
  for (const entry of raw.slice(-MAX_HISTORY_MESSAGES)) {
    const msg = entry as IncomingMessage;
    if (
      (msg?.role === 'user' || msg?.role === 'assistant') &&
      typeof msg.content === 'string' &&
      msg.content.trim()
    ) {
      normalized.push({ role: msg.role, content: msg.content });
    }
  }

  if (normalized.length === 0 || normalized[normalized.length - 1].role !== 'user') {
    throw new ApiRequestError('Last message must be a non-empty user message', 400);
  }

  return normalized;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { blueprint, messages, apiKey, provider, modelId } = body as Record<string, unknown>;
    if (!blueprint || typeof blueprint !== 'object') {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const normalizedMessages = normalizeMessages(messages);
    const model = resolveLanguageModel(provider, modelId, apiKey);

    const instructions = `You are an expert Software Architect and AI Assistant for the "Blueprint Builder" platform.
You are helping the user with their software project.

Here is the JSON representation of the user's project Blueprint:
\`\`\`json
${JSON.stringify(blueprint, null, 2)}
\`\`\`

Instructions:
1. Answer the user's technical questions based on their selected blueprint features, tech stack, and goals.
2. Be concise, highly technical, and extremely accurate.
3. If the user asks for a recommendation, consider what they have already selected.
4. Format your response beautifully in Markdown (you can use tables, lists, bold text, etc.). Do not wrap the whole response in a markdown block.`;

    const { text } = await generateText({
      model,
      instructions,
      messages: normalizedMessages,
      temperature: 0.3,
    });

    return NextResponse.json({ text });
  } catch (error: unknown) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Chat Error:', error);
    return NextResponse.json({ error: 'Failed to get chat response' }, { status: 500 });
  }
}
