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