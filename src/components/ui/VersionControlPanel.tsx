'use client';
import React, { useState, useEffect } from 'react';
import { History, Save, RotateCcw, Loader2 } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';

export default function VersionControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { fetchGraph } = useGraphStore();

  const loadSnapshots = async () => {
    const res = await fetch('/api/snapshots');
    const data = await res.json();
    if (data.success) setSnapshots(data.snapshots);
  };

  useEffect(() => {
    if (isOpen) loadSnapshots();
  }, [isOpen]);

  const handleTakeSnapshot = async () => {
    const title = prompt("현재 맵의 스냅샷 이름을 입력하세요 (예: 1차 정리 완료):", new Date().toLocaleString() + " 백업");
    if (!title) return;
    setIsProcessing(true);
    await fetch('/api/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    await loadSnapshots();
    setIsProcessing(false);
  };

  const handleRestore = async (id: string, title: string) => {
    if (!confirm(`정말 "${title}" 시점으로 맵 전체를 롤백하시겠습니까?\n현재 맵의 변경사항은 모두 영구 유실됩니다.`)) return;
    setIsProcessing(true);
    await fetch('/api/snapshots/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshotId: id })
    });
    
    // 강제 새로고침하여 리테치를 유발
    window.location.reload();
  };

  return (
    <div className="absolute top-24 right-5 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="p-3 rounded-full bg-glass border border-border-glass text-gray-300 hover:text-white hover:border-cyan/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all shadow-lg group">
        <History size={20} className="group-hover:rotate-180 transition-transform duration-500" />
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 w-80 bg-glass/95 border border-border-glass rounded-xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
            <h3 className="text-white font-bold flex items-center gap-2"><History size={16}/> 타임머신 백업 기록</h3>
            <button disabled={isProcessing} onClick={handleTakeSnapshot} className="flex items-center gap-1 text-xs px-2 py-1 bg-cyan/20 text-cyan rounded hover:bg-cyan/40 transition-colors disabled:opacity-50">
              <Save size={12}/> 저장
            </button>
          </div>
          
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {snapshots.map(s => (
              <div key={s.id} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                <div className="text-sm text-white font-medium break-words leading-tight mb-1">{s.title}</div>
                <div className="text-[10px] text-gray-500 mb-3">{new Date(s.created_at).toLocaleString()}</div>
                <button disabled={isProcessing} onClick={() => handleRestore(s.id, s.title)} className="flex items-center justify-center gap-1 pt-2 pb-1.5 w-full bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-md hover:bg-rose-500/20 transition-colors border border-rose-500/20 disabled:opacity-50">
                  {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} 
                  {isProcessing ? '타임머신 작동 중...' : '이 시점으로 롤백(복원)'}
                </button>
              </div>
            ))}
            {snapshots.length === 0 && <div className="text-xs text-gray-500 text-center py-6">저장된 백업 스냅샷이 없습니다.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
