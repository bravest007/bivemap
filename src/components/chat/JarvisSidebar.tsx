'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useGraphStore } from '@/store/useGraphStore';

export default function JarvisSidebar() {
  const [modelLevel, setModelLevel] = useState('normal');
  const [textInput, setTextInput] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { selectedNodeId, nodes } = useGraphStore();
  
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const focusContext = selectedNode ? `선택된 노드 제목: [${selectedNode.data.icon} ${selectedNode.data.label}]\n노드 상세 원문: ${selectedNode.data.original_content || ''}` : null;

  const { messages, sendMessage, status } = useChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!textInput || textInput.trim() === '') return;
    
    // According to SDK v5+, useChat returns sendMessage, and UIMessage expects 'parts' or 'text' depending on the union
    // We send { parts: [{ type: 'text', text: textInput }] } to be safest and comply with convertToModelMessages
    sendMessage({ parts: [{ type: 'text', text: textInput }] }, { body: { modelId: modelLevel, focusContext } });
    setTextInput('');
  };

  return (
    <div className={`absolute right-0 top-0 h-full w-full md:w-[400px] z-40 p-4 transform transition-transform duration-300 pointer-events-none fade-in ${isMobileOpen ? 'translate-y-16' : 'translate-y-[calc(100%-80px)]'} md:translate-y-0`}>
      <div className="h-full w-full rounded-2xl bg-glass border border-border-glass backdrop-blur-xl flex flex-col overflow-hidden pointer-events-auto shadow-2xl transition-all duration-300">
        
        {/* Header - Clickable on mobile to toggle */}
        <div 
          className="p-4 border-b border-border-glass flex justify-between items-center bg-black/20 md:cursor-default cursor-pointer touch-manipulation"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-purple-500 shadow-[0_0_8px_#B537F2] animate-pulse' : 'bg-cyan shadow-[0_0_8px_#00F3FF]'}`}></div>
            <span className="font-bold text-white tracking-widest text-sm flex items-center gap-2">
              JARVIS
               {/* Mobile toggle hint icon */}
              <svg className={`w-4 h-4 md:hidden transition-transform duration-300 ${isMobileOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </span>
          </div>
          
          <select 
            value={modelLevel} 
            onChange={(e) => setModelLevel(e.target.value)}
            className="text-xs font-medium bg-cyan/10 text-cyan px-2 py-1 rounded-md border border-cyan/20 outline-none cursor-pointer"
          >
            <option value="light">🚀 Light (3.1 Flash-Lite)</option>
            <option value="normal">⚡ Normal (2.5 Flash)</option>
            <option value="pro">🧠 Pro (2.5 Pro)</option>
          </select>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-300 self-start max-w-[85%] leading-relaxed shadow-sm">
            안녕하세요 대표님. 원하시는 기획 자료나 프롬프트 팁을 캔버스 위 검색창에 넣어주세요. 상황에 맞게 뇌(AI 모델) 레벨을 선택하시면 더욱 똑똑하게 답변해 드립니다!
          </div>
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`p-3 text-sm rounded-xl max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-cyan/20 border border-cyan/30 text-cyan-50 self-end' : 'bg-white/5 border border-white/10 text-gray-300 self-start pb-4'}`}
            >
              {m.parts ? m.parts.map((p: any, i: number) => p.type === 'text' ? <span key={i}>{p.text}</span> : null) : ((m as any).content || (m as any).text || '')}
            </div>
          ))}
          {isLoading && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-400 self-start animate-pulse">
              자비스가 생각 중입니다...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-border-glass">
          <form onSubmit={onFormSubmit} className="relative">
            <input 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              type="text" 
              placeholder="자비스에게 무엇이든 질문하기..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white outline-none focus:border-cyan/50 transition-colors"
            />
            <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan hover:text-black transition-colors disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
