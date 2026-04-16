import { streamText, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30; // Serverless function max duration

export async function POST(req: Request) {
  try {
    const { messages, modelId = 'normal' } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Model selection logic
    const modelMapping: Record<string, string> = {
      'light': 'gemini-3.1-flash-lite-preview',
      'normal': 'gemini-2.5-flash',
      'pro': 'gemini-2.5-pro'
    };
    const targetModel = modelMapping[modelId] || 'gemini-2.5-flash';

    // 1. Generate embedding for the user's query
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: latestMessage,
    });

    // MRL Slice: DB 한계 극복용 768 자르기
    const safeEmbedding = embedding.slice(0, 768);

    // 2. Perform similarity search (RAG retrieval)
    const supabase = await createClient();
    const { data: matchedNodes, error } = await supabase.rpc('match_nodes', {
      query_embedding: safeEmbedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) {
      console.error("Vector Search Error:", error);
    }

    const contextStr = matchedNodes && matchedNodes.length > 0
      ? matchedNodes.map((n: any) => `[${n.label}]: ${n.original_content}`).join('\n')
      : "현재 마인드맵에 관련된 명확한 지식이 없습니다.";

    // 3. Construct System Prompt with RAG Context
    const systemPrompt = `
      당신은 BiveMap의 핵심 AI 비서 '자비스(JARVIS)'입니다.
      사용자의 질문에 대해 친절하고 이해하기 쉬운 구어체 한국어로 답변하세요.
      아래에 제공된 [마인드맵 지식 컨텍스트(RAG)]를 기반으로 정확하게 정보 위주로 설명하세요.
      해당 컨텍스트 외의 내용은 모른다고 하거나 일반적인 조언을 덧대어 대답해도 좋습니다.

      [마인드맵 지식 컨텍스트 (RAG)]
      ${contextStr}
    `;

    // 4. Stream response to client via Vercel AI SDK
    const result = streamText({
      model: google(targetModel),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
