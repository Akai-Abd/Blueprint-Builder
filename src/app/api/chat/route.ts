import { generateText } from 'ai';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { createCohere } from '@ai-sdk/cohere';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { blueprint, messages, apiKey, provider = 'google', modelId } = await req.json();

    if (!blueprint || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    let model;
    
    if (provider === 'openai') {
      const customOpenAI = apiKey ? createOpenAI({ apiKey }) : createOpenAI();
      model = customOpenAI(modelId || 'gpt-4o');
    } else if (provider === 'anthropic') {
      const customAnthropic = apiKey ? createAnthropic({ apiKey }) : createAnthropic();
      model = customAnthropic(modelId || 'claude-3-5-sonnet-20240620');
    } else if (provider === 'mistral') {
      const customMistral = apiKey ? createMistral({ apiKey }) : createMistral();
      model = customMistral(modelId || 'mistral-large-latest');
    } else if (provider === 'groq') {
      const customGroq = apiKey ? createGroq({ apiKey }) : createGroq();
      model = customGroq(modelId || 'llama-3-70b-versatile');
    } else if (provider === 'cohere') {
      const customCohere = apiKey ? createCohere({ apiKey }) : createCohere();
      model = customCohere(modelId || 'command-r-plus');
    } else {
      const customGoogle = apiKey ? createGoogleGenerativeAI({ apiKey }) : google;
      model = customGoogle(modelId || 'gemini-3-flash-preview');
    }

    const systemPrompt = `You are an expert Software Architect and AI Assistant for the "Blueprint Builder" platform.
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

    const lastUserMessage = messages[messages.length - 1]?.content || 'Hello';

    const { text } = await generateText({
      model: model,
      system: systemPrompt,
      prompt: lastUserMessage,
      temperature: 0.3,
    });

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to get chat response' },
      { status: 500 }
    );
  }
}
