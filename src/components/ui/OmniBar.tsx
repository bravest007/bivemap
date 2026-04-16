'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';

export default function OmniBar() {
  const [content, setContent] = useState('');
  const [modelLevel, setModelLevel] = useState('normal');
  const [isIngesting, setIsIngesting] = useState(false);
  const addNode = useGraphStore(state => state.addNode);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isIngesting) return;

    setIsIngesting(true);
    try {
      // 지정할 랜덤 좌표
      const randX = Math.floor(Math.random() * 400 + 100);
      const randY = Math.floor(Math.random() * 400 + 100);

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, modelId: modelLevel, x: randX, y: randY }),
      });
      
      const data = await res.json();
      if (data.success && data.node) {
        const newNode = {
          id: data.node.id,
          position: { x: data.node.x_pos, y: data.node.y_pos },
          data: { label: data.node.label, icon: data.node.icon },
          type: 'organic'
        };
        addNode(newNode);
        setContent(''); // reset
      } else {
        alert(data.error || '처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버 통신 실패: API 키와 Supabase 세팅을 확인해주세요.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[700px] z-50 pointer-events-auto">
      <form onSubmit={handleIngest} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-glass border border-border-glass backdrop-blur-xl shadow-lg transition-all focus-within:shadow-[0_0_15px_rgba(0,243,255,0.2)] focus-within:border-cyan/50">
        {isIngesting ? <Loader2 className="text-cyan animate-spin w-5 h-5 flex-shrink-0" /> : <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />}
        <input 
          value={content}
          onChange={e => setContent(e.target.value)}
          type="text" 
          placeholder="텍스트나 URL을 붙여넣으면 로컬 DB에 자동 영구 저장됩니다." 
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 min-w-0 text-sm"
          disabled={isIngesting}
        />
        
        <select 
          value={modelLevel} 
          onChange={(e) => setModelLevel(e.target.value)}
          className="hidden sm:block text-xs font-medium bg-white/5 border border-white/10 text-gray-300 px-2 py-1.5 rounded-md outline-none cursor-pointer hover:bg-white/10 transition-colors mr-2"
        >
          <option value="light">🚀 3.1 FL</option>
          <option value="normal">⚡ 2.5 FL</option>
          <option value="pro">🧠 2.5 PR</option>
        </select>

        <button type="submit" disabled={isIngesting || !content.trim()} className="hidden sm:block text-[10px] uppercase font-bold text-gray-500 border border-gray-700 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50">Enter</button>
      </form>
    </div>
  );
}
