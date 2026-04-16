'use client';

import React from 'react';
import { Search, PlusCircle, Loader2, History } from 'lucide-react';
import DraftModal from './DraftModal';
import { TimeMachineModal } from './TimeMachineModal';
import { useOmniActions } from '@/hooks/useOmniActions';

export default function OmniBar() {
  const {
    content, setContent,
    mode, setMode,
    modelLevel, setModelLevel,
    isProcessing,
    draft, setDraft,
    isSaving,
    showTimeMachine, setShowTimeMachine,
    handleSubmit,
    approveDraft
  } = useOmniActions();

  return (
    <>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[700px] z-50 pointer-events-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-glass border border-border-glass backdrop-blur-xl shadow-lg transition-all focus-within:shadow-[0_0_15px_rgba(0,243,255,0.2)] focus-within:border-cyan/50">
          
          {/* Dual Mode Switch */}
          <div className="flex bg-black/40 rounded-lg p-1 mr-1">
            <button type="button" onClick={() => setMode('search')} className={`p-1.5 rounded-md transition-all ${mode === 'search' ? 'bg-cyan text-black shadow-sm' : 'text-gray-500 hover:text-white'}`} title="지도 탐색">
              <Search className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setMode('ingest')} className={`p-1.5 rounded-md transition-all ${mode === 'ingest' ? 'bg-purple-500 text-white shadow-[0_0_10px_purple]' : 'text-gray-500 hover:text-white'}`} title="새 지식 주입">
              <PlusCircle className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setShowTimeMachine(true)} className="p-1.5 rounded-md transition-all text-orange-400 hover:text-orange-300 hover:bg-orange-900/30" title="지식 타임머신 (버전 스냅샷)">
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Text Input */}
          <input 
            value={content}
            onChange={e => setContent(e.target.value)}
            type="text" 
            placeholder={mode === 'search' ? "기존 지식 검색 및 이동..." : "URL/텍스트를 붙여넣어 새 지식 초안 생성..."} 
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 min-w-0 text-sm"
            disabled={isProcessing}
          />
          
          {/* AI Model Selector */}
          <select 
            value={modelLevel} 
            onChange={(e) => setModelLevel(e.target.value)}
            className="hidden sm:block text-xs font-medium bg-white/5 border border-white/10 text-gray-300 px-2 py-1.5 rounded-md outline-none cursor-pointer hover:bg-white/10 transition-colors mr-2 appearance-none"
          >
            <option value="light">🚀 3.1 FL</option>
            <option value="normal">⚡ 2.5 FL</option>
            <option value="pro">🧠 2.5 PR</option>
          </select>

          {/* Submit Button */}
          <button type="submit" disabled={isProcessing || !content.trim()} className="flex items-center justify-center min-w-[50px] text-[10px] uppercase font-bold text-gray-400 border border-gray-600 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50">
            {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : 'Enter'}
          </button>
        </form>
      </div>

      <DraftModal draft={draft} onApprove={approveDraft} onCancel={() => setDraft(null)} isSaving={isSaving} />
      <TimeMachineModal isOpen={showTimeMachine} onClose={() => setShowTimeMachine(false)} />
    </>
  );
}
