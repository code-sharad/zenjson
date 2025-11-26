import React, { useRef } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: { message: string; line?: number } | null;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        // Defer cursor update to next tick to ensure value update
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  // Basic line numbers (visual only, simple approximation)
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div className="relative h-full w-full flex bg-surface rounded-xl border border-border overflow-hidden font-mono text-sm group focus-within:ring-1 focus-within:ring-primary/50 transition-all">
      <div className="bg-[#121214] text-muted/30 p-4 text-right select-none border-r border-border min-w-[3rem] overflow-hidden">
        <pre className="font-mono leading-6">{lineNumbers}</pre>
      </div>
      <div className="relative flex-1 h-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your JSON here..."
          className="w-full h-full bg-transparent text-text p-4 resize-none focus:outline-none leading-6 whitespace-pre font-mono"
          spellCheck={false}
        />
        {error && (
            <div className="absolute bottom-4 right-4 bg-error/10 border border-error/50 text-error px-4 py-2 rounded-lg text-xs backdrop-blur-md shadow-lg pointer-events-none animate-bounce">
                Error: {error.message} {error.line ? `(Line ${error.line})` : ''}
            </div>
        )}
      </div>
    </div>
  );
};

export default JsonEditor;