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
import { generateAutoLayout } from './useAutoLayout';
import { Network } from 'lucide-react';
import { Panel } from '@xyflow/react';

export default function MindMapCanvas() {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const onConnect = useGraphStore((state) => state.onConnect);
  const fetchGraph = useGraphStore((state) => state.fetchGraph);
  
  const nodeTypes = useMemo(() => ({ organic: OrganicNode }), []);

  const [initialViewport, setInitialViewport] = React.useState<any>(undefined);
  const [isClient, setIsClient] = React.useState(false);
  const [rfInstance, setRfInstance] = React.useState<any>(null);

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

  // Listen to omnibar-search dispatches to roam the camera
  React.useEffect(() => {
    const handleSearch = (e: any) => {
      if (!rfInstance) return;
      const targetNode = nodes.find(n => n.id === e.detail);
      if (targetNode) {
        rfInstance.setCenter(targetNode.position.x, targetNode.position.y, { duration: 800, zoom: 1.5 });
      }
    };
    window.addEventListener('omnibar-search', handleSearch);
    return () => window.removeEventListener('omnibar-search', handleSearch);
  }, [rfInstance, nodes]);

  const handleSelectionChange = React.useCallback((params: any) => {
    const selected = params.nodes[0] ? params.nodes[0].id : null;
    const currentSelected = useGraphStore.getState().selectedNodeId;
    if (currentSelected !== selected) {
      useGraphStore.getState().setSelectedNodeId(selected);
    }
  }, []);

  const handleAutoLayout = () => {
    const { layoutedNodes, layoutedEdges } = generateAutoLayout(nodes, edges, 'LR');
    // Bulk update positions in local store (ideally sync to DB later if needed)
    useGraphStore.setState({ nodes: [...layoutedNodes] });
    
    // Fit view after a small delay to let nodes render
    setTimeout(() => {
      rfInstance?.fitView({ duration: 800, padding: 0.2 });
    }, 50);
  };

  if (!isClient) return null;

  return (
    <MainLayout>
      <OmniBar />
      <JarvisSidebar />
      <div className="absolute inset-0 w-full h-full z-10" style={{ background: '#050505' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setRfInstance}
          onSelectionChange={handleSelectionChange}
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
          
          <Panel position="bottom-left" className="mb-8 ml-14">
            <button 
              onClick={handleAutoLayout}
              className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 hover:bg-cyan-900/60 hover:border-cyan-500 hover:text-cyan-400 text-slate-300 px-4 py-2 rounded-xl backdrop-blur-md transition-all shadow-lg text-sm font-medium"
              title="노드 자동 정렬 기능"
            >
              <Network className="w-4 h-4" />
              자동 정렬
            </button>
          </Panel>

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
