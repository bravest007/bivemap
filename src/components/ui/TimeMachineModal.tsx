import React, { useState, useEffect } from 'react';
import { History, Save, RotateCcw, X, Loader2 } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';

interface Snapshot {
  id: string;
  created_at: string;
  description: string;
}

interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TimeMachineModal({ isOpen, onClose }: TimeMachineModalProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState('');
  const fetchGraph = useGraphStore(state => state.fetchGraph);

  useEffect(() => {
    if (isOpen) {
      fetchSnapshots();
    }
  }, [isOpen]);

  const fetchSnapshots = async () => {
    try {
      const res = await fetch('/api/snapshots');
      const data = await res.json();
      if (data.success) {
        setSnapshots(data.snapshots);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSnapshot = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc || '수동 백업 스냅샷' })
      });
      if (res.ok) {
        setDesc('');
        fetchSnapshots();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('경고: 현재 마인드맵의 모든 구조가 지워지고 해당 시점으로 강제 덮어쓰기 됩니다. 롤백하시겠습니까?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/snapshots/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId: id })
      });
      if (res.ok) {
        // Refresh graph!
        await fetchGraph();
        onClose();
        alert('과거 시점으로 무사히 롤백되었습니다.');
      } else {
        alert('롤백 실패');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center bg-cyan-950/30 -mx-6 -mt-6 p-4 rounded-t-2xl border-b border-cyan-800/50 mb-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <History className="w-5 h-5" />
            <h2 className="font-bold text-lg">지식 타임머신 (Version Control)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Form */}
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="현재 상태 요약 (ex. 리액트 구조 개편 직전)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <button 
            onClick={handleCreateSnapshot}
            disabled={loading}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
            백업
          </button>
        </div>

        {/* Snapshot List */}
        <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-2 pr-1 custom-scrollbar">
          {snapshots.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">
              보관된 스냅샷이 없습니다.
            </div>
          ) : (
            snapshots.map((snap) => (
              <div key={snap.id} className="flex justify-between items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-200 font-medium">{snap.description}</span>
                  <span className="text-xs text-slate-500">{new Date(snap.created_at).toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => handleRestore(snap.id)}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-300 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  롤백
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
