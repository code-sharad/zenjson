'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Download, Trash2, Clock, FileJson, ChevronRight, Wand2, Zap, Minimize2, Maximize2, Save, Check } from 'lucide-react';
import { HistoryItem, HistoryActionType } from '../types';
import Button from './Button';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onDelete: (id: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onImport,
  onExport,
  onDelete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [deletedItems, setDeletedItems] = useState<Set<string>>(new Set());

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getActionIcon = (type?: HistoryActionType) => {
    switch (type) {
      case 'AI_FIX': return <Wand2 size={10} />;
      case 'MINIFY': return <Minimize2 size={10} />;
      case 'FORMAT': return <Maximize2 size={10} />;
      case 'SAMPLE': return <Zap size={10} />;
      case 'SAVE': return <Save size={10} />;
      default: return <FileJson size={10} />;
    }
  };

  const getActionLabel = (type?: HistoryActionType) => {
    return type ? type.replace('_', ' ') : 'JSON';
  };

  const getActionColor = (type?: HistoryActionType) => {
    switch (type) {
      case 'AI_FIX': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'MINIFY': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'FORMAT': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'SAMPLE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'SAVE': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-white/10 text-muted border-white/10';
    }
  };

  const handleDownloadItem = (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(item.content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `json_${item.actionType?.toLowerCase() || 'saved'}_${item.timestamp}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImport(e);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 2000);
  };

  const handleExport = () => {
    onExport();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleClear = () => {
    onClear();
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 2000);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeletedItems(prev => new Set(prev).add(id));
    setTimeout(() => {
      setDeletedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-surface/95 backdrop-blur-xl border-r border-border z-50 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-surface/50 to-surface/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <Clock size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-text font-semibold">History</h2>
                  <p className="text-xs text-muted">{history.length} {history.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-text transition-all hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 border-b border-border grid grid-cols-2 gap-2 bg-surface/30">
              <Button 
                variant={importSuccess ? 'success' : 'secondary'}
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                icon={importSuccess ? <Check size={14} /> : <Upload size={14} />}
                className={`w-full justify-center text-xs h-9 hover:scale-105 transition-all ${importSuccess ? 'bg-success hover:bg-success text-white' : ''}`}
              >
                {importSuccess ? 'Imported!' : 'Import'}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json"
                onChange={handleImport}
              />
              <Button 
                variant={exportSuccess ? 'success' : 'secondary'}
                size="sm" 
                onClick={handleExport}
                icon={exportSuccess ? <Check size={14} /> : <Download size={14} />}
                className={`w-full justify-center text-xs h-9 hover:scale-105 transition-all ${exportSuccess ? 'bg-success hover:bg-success text-white' : ''}`}
                disabled={history.length === 0}
              >
                {exportSuccess ? 'Exported!' : 'Export'}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted/50 p-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FileJson size={56} className="mb-4 opacity-20" />
                  </motion.div>
                  <p className="text-sm font-semibold text-muted">No history yet</p>
                  <p className="text-xs mt-2 max-w-[200px] text-muted/70 leading-relaxed">
                    Format, minify, or save JSON to see it here
                  </p>
                </div>
              ) : (
                history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.02 }}
                    className="group relative bg-gradient-to-br from-background/60 to-background/40 border border-border/50 hover:border-primary/50 rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md hover:shadow-primary/10 hover:bg-background/90 hover:scale-[1.02]"
                    onClick={() => onSelect(item)}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider shadow-sm ${getActionColor(item.actionType)}`}>
                        {getActionIcon(item.actionType)}
                        {getActionLabel(item.actionType)}
                      </div>
                      <span className="text-[10px] text-muted font-medium bg-surface/50 px-2 py-0.5 rounded-md">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-text/70 line-clamp-3 break-all leading-relaxed pl-2.5 transition-colors">
                      {item.preview}
                    </div>
                    
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-surface/95 backdrop-blur-md rounded-lg border border-border/50 p-0.5 transition-all shadow-lg">
                      <button
                          onClick={(e) => handleDownloadItem(e, item)}
                          className="p-1.5 hover:bg-primary/20 hover:text-primary rounded-md transition-all"
                          title="Download this file"
                        >
                          <Download size={12} />
                      </button>
                      <div className="w-px h-3 bg-border/50"></div>
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className={`p-1.5 rounded-md transition-all ${
                            deletedItems.has(item.id) 
                              ? 'bg-success/20 text-success' 
                              : 'hover:bg-error/20 hover:text-error'
                          }`}
                          title="Delete item"
                        >
                          {deletedItems.has(item.id) ? <Check size={12} /> : <Trash2 size={12} />}
                      </button>
                    </div>
                    
                    <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 text-primary translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ChevronRight size={14} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-border bg-gradient-to-t from-surface/80 to-surface/50 backdrop-blur-md">
                <Button 
                  variant={clearSuccess ? 'success' : 'danger'}
                  size="sm" 
                  onClick={handleClear}
                  icon={clearSuccess ? <Check size={14} /> : <Trash2 size={14} />}
                  className={`w-full opacity-90 hover:opacity-100 hover:scale-105 transition-all shadow-lg ${clearSuccess ? 'bg-success hover:bg-success text-white' : ''}`}
                >
                  {clearSuccess ? 'Cleared!' : 'Clear All History'}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;