import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { snapshotId } = await req.json();
    if (!snapshotId) return NextResponse.json({ error: "Snapshot ID missing" }, { status: 400 });

    const supabase = await createClient();

    // 1. Fetch the snapshot
    const { data: snapshot, error: fetchError } = await supabase
      .from('mindmap_snapshots')
      .select('nodes_state, edges_state')
      .eq('id', snapshotId)
      .single();

    if (fetchError || !snapshot) throw new Error("Snapshot not found");

    // 2. Clear current graph
    // Supabase REST requires a filter for deletions.
    const { error: delEdgesErr } = await supabase.from('mindmap_edges').delete().neq('id', 'dummy-filter');
    if (delEdgesErr) throw delEdgesErr;

    const { error: delNodesErr } = await supabase.from('mindmap_nodes').delete().neq('id', 'dummy-filter');
    if (delNodesErr) throw delNodesErr;

    // 3. Insert the old states
    if (snapshot.nodes_state && snapshot.nodes_state.length > 0) {
      const { error: insertNodesErr } = await supabase.from('mindmap_nodes').insert(snapshot.nodes_state);
      if (insertNodesErr) throw insertNodesErr;
    }

    if (snapshot.edges_state && snapshot.edges_state.length > 0) {
      const { error: insertEdgesErr } = await supabase.from('mindmap_edges').insert(snapshot.edges_state);
      if (insertEdgesErr) throw insertEdgesErr;
    }

    return NextResponse.json({ success: true, message: "Restored successfully" });
  } catch (error: any) {
    console.error("Restore Snapshot Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
