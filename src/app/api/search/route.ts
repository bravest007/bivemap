import { NextResponse } from 'next/server';
import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: query,
    });
    
    const safeEmbedding = embedding.slice(0, 768);

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('match_nodes', {
      query_embedding: safeEmbedding,
      match_threshold: 0.1, // Lower threshold to find somewhat related results
      match_count: 1,
    });

    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json({ success: true, node: data[0] });
    } else {
      return NextResponse.json({ success: false, error: '관련된 지식을 찾을 수 없습니다.' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
