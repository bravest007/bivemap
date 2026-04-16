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
