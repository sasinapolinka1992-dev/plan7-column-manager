
export enum ParameterType {
  STRING = 'Строка',
  MONEY = 'Денежный',
  DATE = 'Дата',
  LIST = 'Список',
  NUMERIC = 'Числовая',
  FORMULA = 'Формула'
}

export enum FormulaOutputType {
  NUMBER = 'Число',
  PERCENT = 'Процент',
  CURRENCY = 'Денежный'
}

export interface FormulaPart {
  operator: '+' | '-' | '*' | '/';
  colId: string;
  bracketsBefore?: number;
  bracketsAfter?: number;
}

export interface FormulaConfig {
  initialColId: string;
  initialBracketsBefore?: number;
  initialBracketsAfter?: number;
  parts: FormulaPart[];
  outputType: FormulaOutputType;
}

export interface Column {
  id: string;
  label: string;
  visible: boolean;
  isCustom?: boolean;
  isFavorite?: boolean;
  type?: ParameterType;
  options?: string[];
  isMultiSelect?: boolean;
  precision?: number;
  currency?: string;
  formula?: FormulaConfig;
}

export interface Section {
  title: string;
  columns: Column[];
}
