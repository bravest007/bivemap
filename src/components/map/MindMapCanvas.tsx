'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import OrganicNode from './nodes/OrganicNode';
import MainLayout from '@/components/layout/MainLayout';
import OmniBar from '@/components/ui/OmniBar';
import JarvisSidebar from '@/components/chat/JarvisSidebar';
import { useGraphStore } from '@/store/useGraphStore';

export default function MindMapCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, fetchGraph } = useGraphStore();
  const nodeTypes = useMemo(() => ({ organic: OrganicNode }), []);

  const [initialViewport, setInitialViewport] = React.useState<any>(undefined);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    fetchGraph();
    const savedViewport = localStorage.getItem('bivemap_viewport');
    if (savedViewport) {
      try {
        setInitialViewport(JSON.parse(savedViewport));
      } catch (e) {}
    }
    setIsClient(true);
  }, [fetchGraph]);

  if (!isClient) return null;

  return (
    <MainLayout>
      <OmniBar />
      <JarvisSidebar />
      <div className="absolute inset-0 w-full h-full z-10" style={{ background: '#050505' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onMoveEnd={(e, viewport) => {
            localStorage.setItem('bivemap_viewport', JSON.stringify(viewport));
          }}
          nodeTypes={nodeTypes}
          defaultViewport={initialViewport}
          fitView={!initialViewport}
          minZoom={0.1}
          maxZoom={4}
          proOptions={{ hideAttribution: true }}
          className="dark"
        >
          <Controls className="opacity-50 hover:opacity-100 transition-opacity !bottom-8" />
          <MiniMap 
            nodeStrokeWidth={3} 
            zoomable 
            pannable 
            style={{ backgroundColor: 'rgba(10,10,10,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', right: '420px', bottom: '24px' }} 
            nodeColor={(node) => node.selected ? '#00F3FF' : '#333'}
            maskColor="rgba(0, 0, 0, 0.7)"
          />
          <Background color="#222" gap={30} variant={BackgroundVariant.Dots} size={1.5} />
        </ReactFlow>
      </div>
    </MainLayout>
  );
}
