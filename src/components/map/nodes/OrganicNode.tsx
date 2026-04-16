import { Handle, Position } from '@xyflow/react';

interface OrganicNodeProps {
  data: {
    label: string;
    icon?: string;
  };
  selected?: boolean;
}

export default function OrganicNode({ data, selected }: OrganicNodeProps) {
  return (
    <div className={`
      px-5 py-3 rounded-full border bg-glass backdrop-blur-md text-white 
      flex items-center gap-3 transition-all duration-200 cursor-pointer
      hover:border-cyan/50 hover:shadow-[0_0_10px_rgba(0,243,255,0.2)]
      ${selected ? 'border-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)] bg-black/80' : 'border-border-glass'}
    `}>
      <Handle type="target" position={Position.Left} className="opacity-0 w-2 h-2" />
      {data.icon && <span className="text-xl flex-shrink-0 leading-none">{data.icon}</span>}
      <span className="font-semibold text-sm tracking-wide whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
        {data.label}
      </span>
      <Handle type="source" position={Position.Right} className="opacity-0 w-2 h-2" />
    </div>
  );
}
