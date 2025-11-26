export enum ViewMode {
  CODE = 'CODE',
  TREE = 'TREE'
}

export interface JsonError {
  message: string;
  line?: number;
}

export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonValue[] 
  | { [key: string]: JsonValue };

export interface ValidationResult {
  isValid: boolean;
  error?: JsonError;
  parsed?: JsonValue;
}

export type HistoryActionType = 'FORMAT' | 'MINIFY' | 'AI_FIX' | 'SAMPLE' | 'IMPORT' | 'EDIT' | 'SAVE';

export interface HistoryItem {
  id: string;
  timestamp: number;
  content: string;
  preview: string;
  actionType?: HistoryActionType;
}