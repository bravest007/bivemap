import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: snapshots, error } = await supabase
      .from('mindmap_snapshots')
      .select('id, created_at, description')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, snapshots });
  } catch (error: any) {
    console.error("Fetch Snapshots Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    const supabase = await createClient();

    // 1. Fetch current active state
    const { data: nodes, error: nodeError } = await supabase.from('mindmap_nodes').select('*');
    if (nodeError) throw nodeError;

    const { data: edges, error: edgeError } = await supabase.from('mindmap_edges').select('*');
    if (edgeError) throw edgeError;

    // 2. Insert into snapshots
    const { data: snapshot, error: snapError } = await supabase
      .from('mindmap_snapshots')
      .insert({
        description: description || 'User Snapshot',
        nodes_state: nodes,
        edges_state: edges
      })
      .select('id, created_at, description')
      .single();

    if (snapError) throw snapError;
    return NextResponse.json({ success: true, snapshot });
  } catch (error: any) {
    console.error("Create Snapshot Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
