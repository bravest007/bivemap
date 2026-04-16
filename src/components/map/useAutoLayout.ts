import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

const nodeWidth = 250;
const nodeHeight = 80;

export const generateAutoLayout = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set the layout direction ('TB' for Top-to-Bottom, 'LR' for Left-to-Right)
  // rankdir, align, nodesep, ranksep are all customizable
  dagreGraph.setGraph({ rankdir: direction, align: 'UL', nodesep: 50, ranksep: 200 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      // Shift position slightly so the origin is at the top-left rather than center
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { layoutedNodes, layoutedEdges: edges };
};
