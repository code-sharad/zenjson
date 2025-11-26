import { JsonError, ValidationResult, JsonValue } from '../types';

export const validateJson = (input: string): ValidationResult => {
  if (!input.trim()) {
    return { isValid: true, parsed: null };
  }
  try {
    const parsed = JSON.parse(input);
    return { isValid: true, parsed };
  } catch (e: any) {
    let message = 'Invalid JSON';
    let line = undefined;

    if (e instanceof Error) {
      message = e.message;
      // Try to extract line number from common browser error messages
      const match = message.match(/line (\d+)/) || message.match(/position (\d+)/);
      if (match) {
        // Approximate mapping from char position to line if needed, 
        // but for now we trust the error message if it provides line info
        // Simple position calculation:
        if (message.includes('position')) {
           const pos = parseInt(match[1], 10);
           const linesBefore = input.substring(0, pos).split('\n').length;
           line = linesBefore;
        } else {
           line = parseInt(match[1], 10);
        }
      }
    }

    return { 
      isValid: false, 
      error: { message, line } 
    };
  }
};

export const formatJson = (json: JsonValue, indent: number = 2): string => {
  return JSON.stringify(json, null, indent);
};

export const minifyJson = (json: JsonValue): string => {
  return JSON.stringify(json);
};

// A simple recursive syntax highlighter token generator
export const tokenizeJson = (jsonString: string) => {
  // This is a basic tokenizer for visual purposes
  // In a real app with 'prismjs' we would use that, 
  // but to keep this zero-dependency heavy, we do a simple regex pass for colors
  
  const tokens: { type: string, value: string }[] = [];
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],:])/g;
  
  let match;
  let lastIndex = 0;
  
  while ((match = regex.exec(jsonString)) !== null) {
    const value = match[0];
    const index = match.index;
    
    // Add whitespace/plain text between matches
    if (index > lastIndex) {
      tokens.push({ type: 'whitespace', value: jsonString.slice(lastIndex, index) });
    }
    
    let type = 'punctuation';
    if (value.startsWith('"')) {
      if (value.endsWith(':')) {
        type = 'key';
      } else {
        type = 'string';
      }
    } else if (/true|false/.test(value)) {
      type = 'boolean';
    } else if (/null/.test(value)) {
      type = 'null';
    } else if (/[0-9]/.test(value)) {
      type = 'number';
    }

    tokens.push({ type, value });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < jsonString.length) {
    tokens.push({ type: 'whitespace', value: jsonString.slice(lastIndex) });
  }
  
  return tokens;
};