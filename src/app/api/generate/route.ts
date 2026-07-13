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
    const { blueprint, documentId, documentTitle, documentDescription, apiKey, provider = 'google', modelId } = await req.json();

    if (!blueprint || !documentTitle) {
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

    const systemPrompt = `You are an expert Software Architect, Product Manager, and Technical Writer.
Your task is to generate a highly detailed, professional project document for a user's application blueprint.

The document you are generating is: **${documentTitle}**
Description of what this document should contain: ${documentDescription}

Here is the JSON representation of the user's project Blueprint:
\`\`\`json
${JSON.stringify(blueprint, null, 2)}
\`\`\`

Instructions:
1. Base the entire document strictly on the provided Blueprint JSON. Extract the project name, features, tech stack, and quality requirements.
2. Be incredibly specific. If the user selected 'Payments', design specific tables or API routes for payments. Do not use generic placeholders.
3. Use proper Markdown formatting.
4. IMPORTANT: Do NOT include markdown code block syntax (e.g. \`\`\`markdown) around your entire response. Your response should just be the raw markdown content itself.
5. Make sure the output is comprehensive and ready for production use.`;

    const { text } = await generateText({
      model: model,
      system: systemPrompt,
      prompt: `Please generate the complete ${documentTitle} document now.`,
      temperature: 0.2,
    });

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate document' },
      { status: 500 }
    );
  }
}
