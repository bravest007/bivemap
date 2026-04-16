-- 타임머신 스냅샷(맵 버전 보존)용 테이블 세팅
CREATE TABLE IF NOT EXISTS map_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 스냅샷 당시의 노드와 선(Edge)의 전체 상태를 얼려두는 보관창고
CREATE TABLE IF NOT EXISTS snapshot_nodes (
  snapshot_id uuid REFERENCES map_snapshots(id) ON DELETE CASCADE,
  id uuid,
  label text,
  icon text,
  original_content text,
  embedding vector(768),
  x_pos float,
  y_pos float
);

CREATE TABLE IF NOT EXISTS snapshot_edges (
  snapshot_id uuid REFERENCES map_snapshots(id) ON DELETE CASCADE,
  id uuid,
  source uuid,
  target uuid
);

-- 1. [기능] 원클릭 스냅샷 찰칵(저장) RPC
CREATE OR REPLACE FUNCTION take_snapshot (snap_title text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_snap_id uuid;
BEGIN
  -- 새 스냅샷 생성
  INSERT INTO map_snapshots (title) VALUES (snap_title) RETURNING id INTO new_snap_id;
  
  -- 현재 노드 복사
  INSERT INTO snapshot_nodes (snapshot_id, id, label, icon, original_content, embedding, x_pos, y_pos)
  SELECT new_snap_id, id, label, icon, original_content, embedding, x_pos, y_pos FROM mindmap_nodes;
  
  -- 현재 선 복사
  INSERT INTO snapshot_edges (snapshot_id, id, source, target)
  SELECT new_snap_id, id, source, target FROM mindmap_edges;
  
  RETURN new_snap_id;
END;
$$;

-- 2. [기능] 원클릭 타임머신 롤백(과거로 되돌리기) RPC
CREATE OR REPLACE FUNCTION restore_snapshot (snap_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 현재 맵 완전히 초기화 (지식 꼬임 리셋)
  DELETE FROM mindmap_edges;
  DELETE FROM mindmap_nodes;

  -- 과거 특정 시점(스냅샷)의 노드 복구
  INSERT INTO mindmap_nodes (id, label, icon, original_content, embedding, x_pos, y_pos)
  SELECT id, label, icon, original_content, embedding, x_pos, y_pos FROM snapshot_nodes WHERE snapshot_id = snap_id;

  -- 과거 특정 시점(스냅샷)의 선 복구
  INSERT INTO mindmap_edges (id, source, target)
  SELECT id, source, target FROM snapshot_edges WHERE snapshot_id = snap_id;
END;
$$;
