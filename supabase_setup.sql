-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 이전 설정 삭제 (충돌 방지용)
DROP FUNCTION IF EXISTS match_nodes;
DROP TABLE IF EXISTS mindmap_nodes;

-- 3. Create the unified nodes table storing both node data and embeddings
CREATE TABLE IF NOT EXISTS mindmap_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  icon text,
  original_content text,
  embedding vector(768), -- DB 인덱스 한계(2000차원)를 피하기 위해 다시 768 스펙으로 복원
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create HNSW index for fast similarity search
CREATE INDEX ON mindmap_nodes USING hnsw (embedding vector_cosine_ops);

-- 5. Create RPC Match function for RAG similarity search
CREATE OR REPLACE FUNCTION match_nodes (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  label text,
  icon text,
  original_content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mindmap_nodes.id,
    mindmap_nodes.label,
    mindmap_nodes.icon,
    mindmap_nodes.original_content,
    1 - (mindmap_nodes.embedding <=> query_embedding) AS similarity
  FROM mindmap_nodes
  WHERE 1 - (mindmap_nodes.embedding <=> query_embedding) > match_threshold
  ORDER BY mindmap_nodes.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
