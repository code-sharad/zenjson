import React, { useState, useEffect, useCallback } from 'react';
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
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import JsonEditor from './components/JsonEditor';
import JsonViewer from './components/JsonViewer';
import Button from './components/Button';
import { validateJson, formatJson, minifyJson } from './utils/jsonUtils';
import { fixJsonWithAI, generateSampleJson } from './services/geminiService';
import { ViewMode, JsonError } from './types';

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [parsed, setParsed] = useState<any>(undefined);
  const [error, setError] = useState<JsonError | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CODE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-format effect
  useEffect(() => {
    const { isValid, parsed: parsedData, error: parseError } = validateJson(input);
    
    if (isValid) {
      setError(null);
      setParsed(parsedData);
      // We don't auto-update output to avoid jumping while typing unless it's a specific action,
      // but keeping the 'parsed' state fresh allows tree view to work.
      // If we want real-time formatted preview:
      if (input.trim().length > 0) {
        // Optional: setOutput(formatJson(parsedData)); 
        // Better UX: Show formatted version of current valid input in output pane
        setOutput(formatJson(parsedData));
      } else {
        setOutput('');
      }
    } else {
      setError(parseError || { message: 'Unknown error' });
      setParsed(undefined);
      // When invalid, output remains last valid or empty? 
      // Let's keep it empty or show error state in viewer? 
      // Minimalist approach: Output pane shows nothing or previous valid.
    }
  }, [input]);

  const handleFormat = () => {
    if (!parsed) return;
    const formatted = formatJson(parsed);
    setInput(formatted); // Update input to match
    setOutput(formatted);
  };

  const handleMinify = () => {
    if (!parsed) return;
    const minified = minifyJson(parsed);
    setInput(minified); // Update input to match
    setOutput(minified);
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
      // The useEffect will trigger and format it
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
      setInput(formatJson(JSON.parse(sample)));
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-text">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-purple-600 p-2 rounded-lg">
            <Braces size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            ZenJSON
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('https://github.com', '_blank')}
            className="hidden sm:flex"
          >
            GitHub
          </Button>
          <div className="h-4 w-px bg-border mx-2 hidden sm:block"></div>
          <span className="text-xs text-muted font-mono">v1.0.0</span>
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
          <Button variant="secondary" size="sm" onClick={handleAiFix} disabled={!error || !input} isLoading={isProcessing} icon={<Wand2 size={14} />} className={error ? "border-primary/50 text-primary" : ""}>
            Fix with AI
          </Button>
          <Button variant="secondary" size="sm" onClick={handleGenerateSample} isLoading={isProcessing} icon={<Sparkles size={14} />}>
            Generate Sample
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
          
          <Button variant="ghost" size="sm" onClick={handleClear} icon={<Trash2 size={14} />}>
            Clear
          </Button>
          <Button 
            variant={copySuccess ? 'success' : 'primary'} 
            size="sm" 
            onClick={handleCopy} 
            icon={copySuccess ? <Check size={14} /> : <Copy size={14} />}
            className={copySuccess ? "bg-green-500 hover:bg-green-600 text-white" : ""}
          >
            {copySuccess ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4 bg-background">
        {/* Editor Pane */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 h-1/2 md:h-full flex flex-col min-w-0"
        >
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Input</span>
            {error ? (
               <span className="text-xs text-error flex items-center gap-1">
                 <AlertCircle size={12} /> Invalid JSON
               </span>
            ) : input ? (
               <span className="text-xs text-success flex items-center gap-1">
                 <Check size={12} /> Valid JSON
               </span>
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
            <span className="text-xs text-muted">
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
           <span>React 18</span>
           <span>Tailwind</span>
           <span>Gemini 2.5</span>
        </div>
      </footer>
    </div>
  );
};

export default App;