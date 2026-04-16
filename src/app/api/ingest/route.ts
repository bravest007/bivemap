import { NextResponse } from 'next/server';
import { generateText, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { content, modelId = 'normal', x = 0, y = 0 } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Model selection logic
    const modelMapping: Record<string, string> = {
      'light': 'gemini-3.1-flash-lite-preview',
      'normal': 'gemini-2.5-flash',
      'pro': 'gemini-2.5-pro'
    };
    const targetModel = modelMapping[modelId] || 'gemini-2.5-flash';

    // 1. Summarize and translate into Korean, extracting a label and an icon
    const prompt = `
      You are an AI assistant for BiveMap, a visual Second Brain.
      Read the following content. If it's not in Korean, perfectly translate and summarize it into natural Korean.
      Return the output strictly in this JSON format without markdown wrapping:
      {
        "label": "A short, catchy phrase representing the content in Korean (English Term in parentheses if applicable). Max 20 chars.",
        "icon": "One single emoji matching the context",
        "summary": "Detailed, easy-to-understand summary in conversational Korean."
      }

      Content to process:
      ${content}
    `;

    const { text } = await generateText({
      model: google(targetModel),
      prompt,
    });

    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Failed to parse Gemini output', text }, { status: 500 });
    }

    // 2. Generate embedding for the vector search
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: parsedResult.summary,
    });

    // MRL (Matryoshka Representation) Slice: pgvector 인덱스 생성 한계를 돌파하기 위한 768 커팅
    const safeEmbedding = embedding.slice(0, 768);

    // 3. Store in Supabase
    const supabase = await createClient();
    const { data, error } = await supabase.from('mindmap_nodes').insert({
      label: parsedResult.label,
      icon: parsedResult.icon,
      original_content: parsedResult.summary,
      embedding: safeEmbedding,
      x_pos: x,
      y_pos: y
    }).select().single();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: 'Database insertion failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, node: data });

  } catch (error: any) {
    console.error("Ingestion Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
