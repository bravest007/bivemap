import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  // 1. Fetch all nodes with their positions
  const { data: nodes, error: nodesError } = await supabase
    .from('mindmap_nodes')
    .select('id, label, icon, original_content, x_pos, y_pos');

  // 2. Fetch all connections
  const { data: edges, error: edgesError } = await supabase
    .from('mindmap_edges')
    .select('id, source, target');

  if (nodesError || edgesError) {
    return NextResponse.json({ error: 'Failed to fetch graph data' }, { status: 500 });
  }

  return NextResponse.json({ nodes: nodes || [], edges: edges || [] });
}

export async function PUT(req: Request) {
  // Update node position when dragged
  try {
    const { id, x, y } = await req.json();
    if (!id || typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('mindmap_nodes')
      .update({ x_pos: x, y_pos: y })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { label, icon, original_content, embedding, x_pos, y_pos } = await req.json();
    const supabase = await createClient();
    
    const { data: newNode, error } = await supabase.from('mindmap_nodes').insert({
      label, icon, original_content, embedding, x_pos, y_pos
    }).select().single();

    if (error) throw error;

    let connectedEdge = null;
    if (embedding) {
      // Find the most similar existing node (fetch 2 in case the #1 match is the newly inserted node itself)
      const { data: matches, error: matchError } = await supabase.rpc('match_nodes', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 2
      });

      if (!matchError && matches && matches.length > 0) {
        // Prevent linking to itself
        const parentNode = matches.find((m: any) => m.id !== newNode.id);
        
        if (parentNode) {
          const { data: generatedEdge, error: edgeError } = await supabase.from('mindmap_edges').insert({
            source: parentNode.id,
            target: newNode.id
          }).select().single();
          
          if (!edgeError) {
            connectedEdge = generatedEdge;
          }
        }
      }
    }

    return NextResponse.json({ success: true, node: newNode, connectedEdge });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
