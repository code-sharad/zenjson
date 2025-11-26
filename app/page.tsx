'use client';

import React, { useState, useEffect } from 'react';
import { 
  Braces, 
  Copy, 
  Trash2, 
  Minimize2, 
  Maximize2, 
  Wand2, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileJson,
  Code2,
  History,
  Menu,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';

import JsonEditor from '../components/JsonEditor';
import JsonViewer from '../components/JsonViewer';
import Button from '../components/Button';
import HistorySidebar from '../components/HistorySidebar';
import { validateJson, formatJson, minifyJson } from '../utils/jsonUtils';
import { fixJsonWithAI, generateSampleJson } from '../services/geminiService';
import { ViewMode, JsonError, HistoryItem, HistoryActionType } from '../types';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [parsed, setParsed] = useState<any>(undefined);
  const [error, setError] = useState<JsonError | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CODE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zenjson_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('zenjson_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (content: string, type: HistoryActionType) => {
    if (!content.trim()) return;
    // Avoid duplicates at the very top of the list to prevent spamming
    if (history.length > 0 && history[0].content === content) return;

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      content,
      preview: content.slice(0, 150) + (content.length > 150 ? '...' : ''),
      actionType: type
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
  };

  // Auto-format effect
  useEffect(() => {
    const { isValid, parsed: parsedData, error: parseError } = validateJson(input);
    
    if (isValid) {
      setError(null);
      setParsed(parsedData);
      if (input.trim().length > 0) {
        setOutput(formatJson(parsedData));
      } else {
        setOutput('');
      }
    } else {
      setError(parseError || { message: 'Unknown error' });
      setParsed(undefined);
    }
  }, [input]);

  const handleFormat = () => {
    if (!parsed) return;
    const formatted = formatJson(parsed);
    setInput(formatted); 
    setOutput(formatted);
    addToHistory(formatted, 'FORMAT');
  };

  const handleMinify = () => {
    if (!parsed) return;
    const minified = minifyJson(parsed);
    setInput(minified);
    setOutput(minified);
    addToHistory(minified, 'MINIFY');
  };

  const handleSave = () => {
    if (!input.trim()) return;
    addToHistory(input, 'SAVE');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output || input);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setParsed(undefined);
    setError(null);
  };

  const handleAiFix = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const fixed = await fixJsonWithAI(input);
      setInput(fixed);
      addToHistory(fixed, 'AI_FIX');
    } catch (e) {
      alert("AI failed to fix JSON.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSample = async () => {
    setIsProcessing(true);
    try {
      const sample = await generateSampleJson("complex user profile with preferences and history");
      const formattedSample = formatJson(JSON.parse(sample));
      setInput(formattedSample);
      addToHistory(formattedSample, 'SAMPLE');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHistoryImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setHistory(imported);
        } else {
          alert('Invalid history file');
        }
      } catch (error) {
        alert('Failed to parse import file');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleHistoryExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "zenjson_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-text">
      <HistorySidebar 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setInput(item.content);
          setHistoryOpen(false);
        }}
        onClear={() => setHistory([])}
        onImport={handleHistoryImport}
        onExport={handleHistoryExport}
        onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))}
      />

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)} className="-ml-2 md:hidden">
             <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-purple-600 p-2 rounded-lg shadow-lg shadow-primary/20">
              <Braces size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              ZenJSON
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setHistoryOpen(true)}
            icon={<History size={16} />}
            className="hidden md:flex text-muted hover:text-primary transition-colors"
          >
            History
          </Button>
          <div className="h-4 w-px bg-border mx-2 hidden sm:block"></div>
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('https://github.com', '_blank')}
            className="hidden sm:flex"
          >
            GitHub
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-surface/50">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <Button variant="secondary" size="sm" onClick={handleFormat} disabled={!!error || !input} icon={<Maximize2 size={14} />}>
            Format
          </Button>
          <Button variant="secondary" size="sm" onClick={handleMinify} disabled={!!error || !input} icon={<Minimize2 size={14} />}>
            Minify
          </Button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <Button variant="secondary" size="sm" onClick={handleAiFix} disabled={!error || !input} isLoading={isProcessing} icon={<Wand2 size={14} />} className={error ? "border-primary/50 text-primary bg-primary/5" : ""}>
            Fix with AI
          </Button>
          <Button variant="secondary" size="sm" onClick={handleGenerateSample} isLoading={isProcessing} icon={<Sparkles size={14} />}>
            Sample
          </Button>
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="flex bg-surface rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setViewMode(ViewMode.CODE)}
              className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.CODE ? 'bg-border text-white shadow-sm' : 'text-muted hover:text-text'}`}
              title="Code View"
            >
              <Code2 size={16} />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.TREE)}
              className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.TREE ? 'bg-border text-white shadow-sm' : 'text-muted hover:text-text'}`}
              title="Tree View"
            >
              <FileJson size={16} />
            </button>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={!input} icon={<Save size={14} />}>
            Save
          </Button>

          <Button variant="ghost" size="sm" onClick={handleClear} icon={<Trash2 size={14} />}>
            Clear
          </Button>
          <Button 
            variant={copySuccess ? 'success' : 'primary'} 
            size="sm" 
            onClick={handleCopy} 
            icon={copySuccess ? <Check size={14} /> : <Copy size={14} />}
            className={copySuccess ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-900/20" : "shadow-lg shadow-primary/20"}
          >
            {copySuccess ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4 bg-background relative">
        {/* Editor Pane */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 h-1/2 md:h-full flex flex-col min-w-0"
        >
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Input</span>
            {error ? (
               <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-error flex items-center gap-1 bg-error/10 px-2 py-0.5 rounded-full border border-error/20">
                 <AlertCircle size={12} /> Invalid JSON
               </motion.span>
            ) : input ? (
               <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                 <Check size={12} /> Valid JSON
               </motion.span>
            ) : null}
          </div>
          <JsonEditor value={input} onChange={setInput} error={error} />
        </motion.div>

        {/* Divider for Desktop */}
        <div className="hidden md:flex items-center justify-center">
            <div className="h-16 w-1 rounded-full bg-border/50"></div>
        </div>

        {/* Viewer Pane */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 h-1/2 md:h-full flex flex-col min-w-0"
        >
           <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                {viewMode === ViewMode.CODE ? 'Formatted Output' : 'Tree Explorer'}
            </span>
            <span className="text-xs text-muted font-mono bg-surface border border-border px-2 py-0.5 rounded-md">
                {parsed ? (Array.isArray(parsed) ? `Array[${parsed.length}]` : `Object{${Object.keys(parsed).length}}`) : 'Empty'}
            </span>
          </div>
          <JsonViewer jsonString={output} parsedData={parsed} mode={viewMode} />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-8 bg-surface border-t border-border flex items-center justify-between px-4 text-[10px] text-muted select-none">
        <div>
           {parsed && `Size: ${new Blob([JSON.stringify(parsed)]).size} bytes`}
        </div>
        <div className="flex gap-4">
           <span>Next.js 14</span>
           <span>Tailwind</span>
           <span>Gemini 2.5</span>
        </div>
      </footer>
    </div>
  );
}