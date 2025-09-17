export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'table' | 'select' | 'textarea';

export type AggregationType = 'sum' | 'count' | 'avg' | 'min' | 'max';
//'any' | 'all' | 'none' will be supported later

export interface Rule {
  id: string;
  field: string; // For a normal rule, this is the field code. For an aggregation, this is the table code.
  operator: string;
  value: any;
  aggregation?: AggregationType;
  column?: string;
  locked?: boolean;
}

export interface RuleGroup {
  id:string;
  combinator: 'AND' | 'OR';
  rules: (Rule | RuleGroup)[];
  combinators?: ('AND' | 'OR')[];
  not?: boolean;
  locked?: boolean;
}

export function isRuleGroup(rule: Rule | RuleGroup): rule is RuleGroup {
  return 'combinator' in rule && 'rules' in rule;
}

export interface Field {
  value: string; // This is the 'code' from the spec
  label: string; // This is the 'name' from the spec
  type: FieldType;
  group?: string; // Parent table code, if this is a column
  values?: any[]; // Sample/available values
  operators?: string[];
  options?: { value: any; label: string }[];
  inputType?: 'radio';
}

export interface Operator {
  value: string;
  label: string;
}

export interface ValidationRule {
  rule: string;
  description: string;
  type: 'required' | 'warning';
}