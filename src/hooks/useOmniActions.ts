import { useState } from 'react';
import { useGraphStore } from '@/store/useGraphStore';

/**
 * OmniBar의 서치, 주입(Ingest), 승인(Approve) 등의 복잡한 상태/API 호출 로직을 전담합니다.
 */
export function useOmniActions() {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'search' | 'ingest'>('search');
  const [modelLevel, setModelLevel] = useState('normal');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  
  const addNode = useGraphStore(state => state.addNode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isProcessing) return;

    if (mode === 'search') {
      await handleSearch();
    } else {
      await handleIngestDraft();
    }
  };

  const handleSearch = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content }),
      });
      const data = await res.json();
      
      if (data.success && data.node) {
        window.dispatchEvent(new CustomEvent('omnibar-search', { detail: data.node.id }));
        setContent('');
      } else {
        alert(data.error || '관련 노드를 찾을 수 없습니다.');
      }
    } catch (err) {
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIngestDraft = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ingest/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, modelId: modelLevel }),
      });
      const data = await res.json();
      
      if (data.success && data.draft) {
        setDraft(data.draft);
      } else {
        alert(data.error || '초안 생성에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const approveDraft = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const randX = Math.floor(Math.random() * 400 + 100);
      const randY = Math.floor(Math.random() * 400 + 100);
      
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: draft.label,
          icon: draft.icon,
          original_content: draft.summary,
          embedding: draft.embedding,
          x_pos: randX,
          y_pos: randY
        })
      });
      
      const data = await res.json();
      if (data.success && data.node) {
        addNode({
          id: data.node.id,
          position: { x: data.node.x_pos, y: data.node.y_pos },
          data: { label: data.node.label, icon: data.node.icon },
          type: 'organic'
        });
        
        if (data.connectedEdge) {
          useGraphStore.getState().addEdgeItem({
            id: data.connectedEdge.id,
            source: data.connectedEdge.source,
            target: data.connectedEdge.target,
            animated: true,
            style: { stroke: '#00F3FF', strokeWidth: 2 }
          });
        }
        
        window.dispatchEvent(new CustomEvent('omnibar-search', { detail: data.node.id }));
        
        setDraft(null);
        setContent('');
      }
    } catch(err) {
      console.error(err);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    content, setContent,
    mode, setMode,
    modelLevel, setModelLevel,
    isProcessing,
    draft, setDraft,
    isSaving,
    showTimeMachine, setShowTimeMachine,
    handleSubmit,
    approveDraft
  };
}
