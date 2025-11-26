import React, { useMemo } from 'react';
import { tokenizeJson } from '../utils/jsonUtils';
import { JsonValue } from '../types';
import { ChevronRight, Braces } from 'lucide-react';
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
    <pre className="font-mono text-sm leading-6 whitespace-pre-wrap break-all p-2">
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
        
        return <span key={i} className={className}>{token.value}</span>;
      })}
    </pre>
  );
};

// Sub-component for Tree View Item
const TreeItem: React.FC<{ name?: string; value: JsonValue; depth?: number; isLast?: boolean }> = ({ name, value, depth = 0, isLast = true }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  
  const getPreview = (val: any) => {
      if (Array.isArray(val)) return `Array(${val.length})`;
      if (val && typeof val === 'object') return `Object{${Object.keys(val).length}}`;
      return String(val);
  };

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="font-mono text-sm relative">
      <div 
        className={`flex items-start group rounded-md pl-1 py-0.5 transition-colors ${isExpandable ? 'cursor-pointer hover:bg-white/5' : ''}`} 
        onClick={isExpandable ? toggle : undefined}
      >
        <div className="w-5 h-5 flex items-center justify-center text-muted/50 group-hover:text-muted transition-colors mr-0.5 shrink-0">
          {isExpandable ? (
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronRight size={14} />
            </motion.div>
          ) : (
             <div className="w-1.5 h-1.5 rounded-full bg-border/50" />
          )}
        </div>
        
        <div className="flex-1 break-all leading-5">
          {name && <span className="text-[#7ee787] mr-1.5 opacity-90">{name}<span className="text-muted/60">:</span></span>}
          
          {!isExpandable ? (
            <span className={
              typeof value === 'string' ? 'text-[#a5d6ff]' :
              typeof value === 'number' ? 'text-[#79c0ff]' :
              typeof value === 'boolean' || value === null ? 'text-[#ff7b72]' : 'text-text'
            }>
              {typeof value === 'string' ? `"${value}"` : String(value)}
            </span>
          ) : (
            <>
              <span className="text-muted/60 text-xs italic select-none bg-surface/80 px-1.5 rounded-full border border-white/5">
                  {isArray ? 'Array' : 'Object'} {isOpen ? '' : getPreview(value)}
              </span>
            </>
          )}
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpandable && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden pl-5 relative border-l border-border/20 ml-2.5"
          >
            {isObject && Object.entries(value as object).map(([k, v], idx, arr) => (
                <TreeItem 
                    key={k} 
                    name={k} 
                    value={v} 
                    depth={depth + 1} 
                    isLast={idx === arr.length - 1} 
                />
            ))}
            {isArray && (value as any[]).map((v, i, arr) => (
                <TreeItem 
                    key={i} 
                    name={String(i)} 
                    value={v} 
                    depth={depth + 1} 
                    isLast={i === arr.length - 1}
                />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JsonViewer: React.FC<JsonViewerProps> = ({ jsonString, parsedData, mode }) => {
  return (
    <div className="h-full w-full bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
       <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          {mode === 'CODE' ? (
            <HighlightedCode code={jsonString} />
          ) : parsedData ? (
            <div className="pt-1">
              <TreeItem value={parsedData} />
            </div>
          ) : (
            <div className="text-muted italic flex items-center justify-center h-full opacity-50">
                <div className="text-center">
                    <Braces className="mx-auto mb-2 opacity-50" size={32} />
                    <p>Valid JSON required for Tree View</p>
                </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default JsonViewer;