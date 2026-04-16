import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  fetchGraph: () => Promise<void>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  addEdgeItem: (edge: Edge) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: true,

  fetchGraph: async () => {
    try {
      const res = await fetch('/api/nodes');
      const data = await res.json();
      if (!data.nodes) return;

      const formattedNodes: Node[] = data.nodes.map((n: any) => ({
        id: n.id,
        position: { x: n.x_pos || 0, y: n.y_pos || 0 },
        data: { label: n.label, icon: n.icon },
        type: 'organic'
      }));
      
      const formattedEdges: Edge[] = data.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: '#00F3FF', strokeWidth: 2 }
      }));

      set({ nodes: formattedNodes, edges: formattedEdges, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });

    changes.forEach((change) => {
      // 드래그가 끝났을 때(dragging: false) 좌표를 서버로 PUT 저장
      if (change.type === 'position' && change.dragging === false) {
        const node = get().nodes.find(n => n.id === change.id);
        if (node) {
          fetch('/api/nodes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: node.id, x: node.position.x, y: node.position.y })
          }).catch(console.error);
        }
      }
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: async (connection: Connection) => {
    // 1. UI 먼저 업데이트 (Optimistic)
    const newEdgeTemplate = { ...connection, id: `e-${connection.source}-${connection.target}`, animated: true, style: { stroke: '#00F3FF', strokeWidth: 2 } };
    set({
      edges: addEdge(newEdgeTemplate, get().edges),
    });

    // 2. DB에 연결선 푸시 저장
    try {
      await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: connection.source, target: connection.target })
      });
    } catch(err) {
      console.error('Failed to save edge', err);
    }
  },

  addNode: (node: Node) => {
    set({ nodes: [...get().nodes, node] });
  },
  
  addEdgeItem: (edge: Edge) => {
    set({ edges: [...get().edges, edge] });
  }
}));
