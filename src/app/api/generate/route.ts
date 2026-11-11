import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ApiRequestError, resolveLanguageModel } from '@/lib/aiProvider';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const {
      blueprint,
      documentTitle,
      documentDescription,
      refinement,
      existingContent,
      apiKey,
      provider,
      modelId,
    } = body as Record<string, unknown>;

    if (
      !blueprint ||
      typeof blueprint !== 'object' ||
      typeof documentTitle !== 'string' ||
      !documentTitle.trim()
    ) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const model = resolveLanguageModel(provider, modelId, apiKey);
    const descriptionText = typeof documentDescription === 'string' ? documentDescription : '';
    const refinementText =
      typeof refinement === 'string' ? refinement.trim().slice(0, 1000) : '';
    const existingExcerpt =
      typeof existingContent === 'string' ? existingContent.trim().slice(0, 12000) : '';

    const instructions = `You are an expert Software Architect, Product Manager, and Technical Writer.
Your task is to generate a highly detailed, professional project document for a user's application blueprint.

The document you are generating is: **${documentTitle}**
Description of what this document should contain: ${descriptionText}

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

    const prompt = refinementText
      ? existingExcerpt
        ? `Please regenerate the ${documentTitle} document incorporating this refinement request:\n${refinementText}\n\nExisting draft to refine/replace:\n${existingExcerpt}`
        : `Please generate the complete ${documentTitle} document now, with special focus on this user instruction:\n${refinementText}`
      : `Please generate the complete ${documentTitle} document now.`;

    const { text } = await generateText({
      model,
      instructions,
      prompt,
      temperature: 0.2,
    });

    return NextResponse.json({ text });
  } catch (error: unknown) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
