-- ==========================================
-- BiveMap Master Initialization SQL (Phase 1~4 통합본)
-- ==========================================

-- 1. pgvector 확장 활성화 (AI 벡터 검색용 필수 엔진)
create extension if not exists vector;

-- 2. 핵심 지식 저장소 (알약 노드 테이블)
create table if not exists mindmap_nodes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text not null,
  original_content text,
  embedding vector(768),
  x_pos float default 0,
  y_pos float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. HNSW 초고속 인덱스 생성 (2000차원 제한이 있어 768로 슬라이싱 적용된 상태)
create index on mindmap_nodes using hnsw (embedding vector_cosine_ops);

-- 4. RAG 검색용 벡터 매칭 함수 (Jarvis / Omni Search 용)
create or replace function match_nodes (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  label text,
  icon text,
  original_content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    label,
    icon,
    original_content,
    1 - (mindmap_nodes.embedding <=> query_embedding) as similarity
  from mindmap_nodes
  where 1 - (mindmap_nodes.embedding <=> query_embedding) > match_threshold
  order by (mindmap_nodes.embedding <=> query_embedding) asc
  limit match_count;
$$;

-- 5. 노드 간 연결선 저장소 (Edge 테이블)
create table if not exists mindmap_edges (
  id uuid primary key default gen_random_uuid(),
  source uuid not null references mindmap_nodes(id) on delete cascade,
  target uuid not null references mindmap_nodes(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 타임머신 스냅샷(맵 버전 보존)용 데이터베이스
-- ==========================================

-- 6. 스냅샷 마스터 테이블
create table if not exists map_snapshots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. 스냅샷 노드 보관창고
create table if not exists snapshot_nodes (
  snapshot_id uuid references map_snapshots(id) on delete cascade,
  id uuid,
  label text,
  icon text,
  original_content text,
  embedding vector(768),
  x_pos float,
  y_pos float
);

-- 8. 스냅샷 연결선 보관창고
create table if not exists snapshot_edges (
  snapshot_id uuid references map_snapshots(id) on delete cascade,
  id uuid,
  source uuid,
  target uuid
);

-- 9. 원클릭 스냅샷 찰칵(저장) RPC
create or replace function take_snapshot (snap_title text)
returns uuid
language plpgsql
as $$
declare
  new_snap_id uuid;
begin
  insert into map_snapshots (title) values (snap_title) returning id into new_snap_id;
  
  insert into snapshot_nodes (snapshot_id, id, label, icon, original_content, embedding, x_pos, y_pos)
  select new_snap_id, id, label, icon, original_content, embedding, x_pos, y_pos from mindmap_nodes;
  
  insert into snapshot_edges (snapshot_id, id, source, target)
  select new_snap_id, id, source, target from mindmap_edges;
  
  return new_snap_id;
end;
$$;

-- 10. 원클릭 타임머신 롤백(과거로 되돌리기) RPC
create or replace function restore_snapshot (snap_id uuid)
returns void
language plpgsql
as $$
begin
  delete from mindmap_edges;
  delete from mindmap_nodes;

  insert into mindmap_nodes (id, label, icon, original_content, embedding, x_pos, y_pos)
  select id, label, icon, original_content, embedding, x_pos, y_pos from snapshot_nodes where snapshot_id = snap_id;

  insert into mindmap_edges (id, source, target)
  select id, source, target from snapshot_edges where snapshot_id = snap_id;
end;
$$;
