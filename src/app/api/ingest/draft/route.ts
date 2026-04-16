import { NextResponse } from 'next/server';
import { generateText, embed } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  try {
    const { content, modelId = 'normal' } = await req.json();

    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const modelMapping: Record<string, string> = {
      'light': 'gemini-3.1-flash-lite-preview',
      'normal': 'gemini-2.5-flash',
      'pro': 'gemini-2.5-pro'
    };
    const targetModel = modelMapping[modelId] || 'gemini-2.5-flash';

    const prompt = `
      You are generating a Draft for a Mindmap Node.
      Translate and summarize the following into natural Korean.
      Critically evaluate the source content for credibility and hallucination risk.
      Return strictly in this JSON format:
      {
        "label": "Short phrase in Korean (max 20 chars)",
        "icon": "One single matching emoji",
        "summary": "Detailed, easy-to-understand summary in Korean.",
        "credibility_comment": "Short Korean comment evaluating source reliability (e.g., '명확한 학술적 근거가 포함되어 신뢰할 수 있습니다.' or '출처가 모호한 인터넷 글로 단독 검증이 필요합니다.')"
      }

      Content: ${content}
    `;

    const { text } = await generateText({
      model: google(targetModel),
      prompt,
    });

    let draft;
    try {
      // Remove any markdown formatting Gemini might append
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      draft = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI output', text }, { status: 500 });
    }

    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: draft.summary,
    });
    
    // MRL Slice to 768 to bypass db limit
    const safeEmbedding = embedding.slice(0, 768);

    return NextResponse.json({ success: true, draft: { ...draft, embedding: safeEmbedding } });
  } catch (error: any) {
    console.error("Draft Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
