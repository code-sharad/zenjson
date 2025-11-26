import React, { useMemo } from 'react';
import { tokenizeJson } from '../utils/jsonUtils';
import { JsonValue } from '../types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JsonViewerProps {
  jsonString: string;
  parsedData: JsonValue | undefined;
  mode: 'CODE' | 'TREE';
}

// Sub-component for syntax highlighting logic
const HighlightedCode: React.FC<{ code: string }> = ({ code }) => {
  const tokens = useMemo(() => tokenizeJson(code), [code]);

  return (
    <pre className="font-mono text-sm leading-6 whitespace-pre-wrap break-all">
      {tokens.map((token, i) => {
        let className = 'text-text';
        switch (token.type) {
          case 'string': className = 'text-[#a5d6ff]'; break; // Light Blue
          case 'key': className = 'text-[#7ee787]'; break; // Green
          case 'number': className = 'text-[#79c0ff]'; break; // Blue
          case 'boolean': className = 'text-[#ff7b72]'; break; // Red/Orange
          case 'null': className = 'text-[#ff7b72]'; break;
          case 'punctuation': className = 'text-muted'; break;
          default: className = 'text-text';
        }
        
        // Handle key specially to remove quotes for visual cleanliness if desired, 
        // but for valid JSON view we keep them. 
        // We just style them differently.
        return <span key={i} className={className}>{token.value}</span>;
      })}
    </pre>
  );
};

// Sub-component for Tree View Item
const TreeItem: React.FC<{ name?: string; value: JsonValue; depth?: number }> = ({ name, value, depth = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  
  const getPreview = (val: any) => {
      if (Array.isArray(val)) return `Array(${val.length})`;
      if (val && typeof val === 'object') return `Object{${Object.keys(val).length}}`;
      return String(val);
  };

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="font-mono text-sm" style={{ marginLeft: depth * 16 }}>
      <div className="flex items-start hover:bg-white/5 rounded px-1 py-0.5 cursor-pointer select-none" onClick={isExpandable ? toggle : undefined}>
        <div className="w-4 h-4 mr-1 mt-1 flex items-center justify-center text-muted">
          {isExpandable && (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </div>
        
        <div className="flex-1 break-all">
          {name && <span className="text-[#7ee787] mr-1">"{name}":</span>}
          
          {!isExpandable ? (
            <span className={
              typeof value === 'string' ? 'text-[#a5d6ff]' :
              typeof value === 'number' ? 'text-[#79c0ff]' :
              typeof value === 'boolean' || value === null ? 'text-[#ff7b72]' : 'text-text'
            }>
              {typeof value === 'string' ? `"${value}"` : String(value)}
            </span>
          ) : (
            <span className="text-muted text-xs italic ml-1 select-none">
                {getPreview(value)}
            </span>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpandable && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {isObject && Object.entries(value as object).map(([k, v]) => (
                <TreeItem key={k} name={k} value={v} depth={1} />
            ))}
            {isArray && (value as any[]).map((v, i) => (
                <TreeItem key={i} name={String(i)} value={v} depth={1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JsonViewer: React.FC<JsonViewerProps> = ({ jsonString, parsedData, mode }) => {
  return (
    <div className="h-full w-full bg-surface rounded-xl border border-border p-4 overflow-auto custom-scrollbar">
      {mode === 'CODE' ? (
        <HighlightedCode code={jsonString} />
      ) : parsedData ? (
         <div className="pt-2">
           <TreeItem value={parsedData} />
         </div>
      ) : (
        <div className="text-muted italic flex items-center justify-center h-full">
            Valid JSON required for Tree View
        </div>
      )}
    </div>
  );
};

export default JsonViewer;