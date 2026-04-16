import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface DraftModalProps {
  draft: any;
  onApprove: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function DraftModal({ draft, onApprove, onCancel, isSaving }: DraftModalProps) {
  if (!draft) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in drop-shadow-2xl">
      <div className="bg-black/80 border border-border-glass p-6 rounded-2xl w-[90%] max-w-lg shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">{draft.icon}</span> {draft.label}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto">
          {draft.summary}
        </div>

        <div className="mb-6 p-3 rounded-xl flex gap-3 text-sm bg-cyan/10 border border-cyan/20">
          <ShieldAlert className="text-cyan w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-cyan mb-1">AI 팩트체크 리포트</div>
            <div className="text-cyan-50 leading-snug">{draft.credibility_comment}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button disabled={isSaving} onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50">거절 및 폐기</button>
          <button disabled={isSaving} onClick={onApprove} className="px-5 py-2 rounded-lg text-sm font-bold bg-cyan text-black hover:bg-cyan/80 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50">
            {isSaving ? '저장 중...' : '신뢰함 (맵에 추가)'}
          </button>
        </div>
      </div>
    </div>
  );
}
