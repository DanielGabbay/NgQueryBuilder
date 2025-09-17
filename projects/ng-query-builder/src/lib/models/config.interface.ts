export interface QueryBuilderConfig {
  addRuleToNewGroups: boolean;
  autoSelectField: boolean;
  autoSelectOperator: boolean;
  autoSelectValue: boolean;
  combinatorsBetweenRules: boolean;
  debugMode: boolean;
  disabled: boolean;
  dragAndDropEnabled: boolean;
  independentCombinators: boolean;
  justifiedLayout: boolean;
  listsAsArrays: boolean;
  parseNumbers: boolean;
  resetOnFieldChange: boolean;
  showNotToggle: boolean;
  showBranches: boolean;
  showCloneButtons: boolean;
  showLockButtons: boolean;
  showShiftActions: boolean;
  showQueryPreview: boolean;
  suppressStandardClasses: boolean;
  useDateTimePackage: boolean;
  useValidation: boolean;
}

export const DEFAULT_QUERY_BUILDER_CONFIG: QueryBuilderConfig = {
  addRuleToNewGroups: false,
  autoSelectField: true,
  autoSelectOperator: true,
  autoSelectValue: false,
  combinatorsBetweenRules: false,
  debugMode: false,
  disabled: false,
  dragAndDropEnabled: true,
  independentCombinators: true,
  justifiedLayout: false,
  listsAsArrays: false,
  parseNumbers: false,
  resetOnFieldChange: true,
  showNotToggle: true,
  showBranches: true,
  showCloneButtons: true,
  showLockButtons: true,
  showShiftActions: false,
  showQueryPreview: true,
  suppressStandardClasses: false,
  useDateTimePackage: true,
  useValidation: true,
};