-- 기존 데이터 유지 보장: mindmap_nodes 테이블에 좌표 컬럼 안전하게 추가 (이미 존재시 에러 무시)
ALTER TABLE mindmap_nodes ADD COLUMN IF NOT EXISTS x_pos float DEFAULT 0;
ALTER TABLE mindmap_nodes ADD COLUMN IF NOT EXISTS y_pos float DEFAULT 0;

-- 새로 신설: 연결선(Edge)을 영구 보존할 테이블
CREATE TABLE IF NOT EXISTS mindmap_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source uuid NOT NULL REFERENCES mindmap_nodes(id) ON DELETE CASCADE,
  target uuid NOT NULL REFERENCES mindmap_nodes(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
