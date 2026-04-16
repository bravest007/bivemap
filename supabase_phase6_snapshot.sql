-- ==============================================================================
-- BiveMap Phase 6: Knowledge Time Machine (Snapshot Control)
-- ==============================================================================

-- 1. Create a table to store complete snapshots of the mind map state
CREATE TABLE IF NOT EXISTS public.mindmap_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  description text NOT NULL,
  nodes_state jsonb NOT NULL,
  edges_state jsonb NOT NULL
);

-- 2. Add some rudimentary RLS (Row Level Security) policies if needed
ALTER TABLE public.mindmap_snapshots ENABLE ROW LEVEL SECURITY;

-- For MVP, allow full access to anon users for snapshots
CREATE POLICY "Allow anon insert on snapshots" ON public.mindmap_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select on snapshots" ON public.mindmap_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow anon delete on snapshots" ON public.mindmap_snapshots FOR DELETE USING (true);
CREATE POLICY "Allow anon update on snapshots" ON public.mindmap_snapshots FOR UPDATE USING (true);

-- 3. (Optional) In order to safely restore data, we want to allow deleting all nodes
-- We already have policies for mindmap_nodes and mindmap_edges, but double check
-- that we can do bulk deletes from the edge/client or secure API route.
