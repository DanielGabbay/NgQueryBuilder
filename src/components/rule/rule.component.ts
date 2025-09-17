import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal, forwardRef } from '@angular/core';
import { Rule, Field, Operator, FieldType, AggregationType, RuleGroup, QuantifierType, ExpressionToken } from '../../models/query-builder.models';
import { QueryDataService } from '../../services/query-data.service';
import { AppConfig } from '../../app.component';
import { TranslationService } from '../../services/translation.service';
import { QueryBuilderComponent } from '../query-builder/query-builder.component';
import { ExpressionBuilderComponent } from '../expression-builder/expression-builder.component';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [forwardRef(() => QueryBuilderComponent), ExpressionBuilderComponent], // For nested builder
})
export class RuleComponent {
  rule = input.required<Rule>();
  config = input.required<AppConfig>();
  /**
   * The set of fields available for this rule.
   * For top-level rules, this is all fields. For nested table rules, it's the table's columns.
   */
  fields = input.required<Field[]>();

  ruleChange = output<Rule>();

  private queryDataService = inject(QueryDataService);
  private translationService = inject(TranslationService);
  t = this.translationService.t;

  // The full Field object for the currently selected field in the rule
  selectedField: Signal<Field | undefined> = computed(() => {
    const ruleField = this.rule().field;
    // Find field in the current context (top-level fields or table columns)
    return this.fields().find(f => f.value === ruleField);
  });
  
  // Columns for the selected table, if it is a table
  tableColumns: Signal<Field[]> = computed(() => {
    const field = this.selectedField();
    if (field?.type === 'table') {
      return this.queryDataService.getColumnsForTable(field.value);
    }
    // For expression builder inside a row condition, use the parent context's fields
    if (this.rule().valueSource === 'expression') {
      return this.fields();
    }
    return [];
  });
  
  expressionFields: Signal<Field[]> = computed(() => this.fields());

  // Aggregation operators if a table is selected
  aggregationOperators: Signal<Operator[]> = this.queryDataService.aggregationOperators;
  arithmeticOperators: Signal<Operator[]> = this.queryDataService.arithmeticOperators;

  quantifiers = computed(() => [
    { value: 'all', label: this.t().quantifierAll },
    { value: 'any', label: this.t().quantifierAny },
    { value: 'none', label: this.t().quantifierNone },
  ]);

  // Regular operators for the selected field or aggregated column
  availableOperators: Signal<Operator[]> = computed(() => {
    const field = this.selectedField();
    if (!field) return [];

    if (field.type === 'table' && this.rule().tableRuleType !== 'rowCondition') {
      // For table aggregations, the result is numeric
      return this.queryDataService.getOperatorsForField('number');
    }
    
    return this.queryDataService.getOperatorsForField(field.type);
  });
  
  showValueInput = computed(() => {
    const operator = this.rule().operator;
    return !['isNull', 'isNotNull', 'isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(operator);
  });
  
  showExpressionBuilderToggle = computed(() => {
    const operator = this.rule().operator;
    // Allow expression for standard comparison operators. Exclude operators that don't take a comparable value or have special UIs.
    return ['=', '!=', '==', '<', '>', '<=', '>='].includes(operator);
  });

  // Fields available for field-to-field comparison
  comparisonFields = computed(() => {
    const currentFieldType = this.selectedField()?.type;
    return this.fields().filter(f => f.type === currentFieldType && f.value !== this.rule().field);
  });

  onFieldChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const field = this.fields().find(f => f.value === selectElement.value);
    if (!field) return;

    const resetOnFieldChange = this.config().resetOnFieldChange;

    if (field.type === 'table') {
      const columns = this.queryDataService.getColumnsForTable(field.value);
      const defaultColumn = columns[0];
      const defaultAggregation = this.queryDataService.aggregationOperators()[0];
      const operators = this.queryDataService.getOperatorsForField('number'); // Aggregation result is a number

      this.ruleChange.emit({
        ...this.rule(),
        field: field.value,
        tableRuleType: 'aggregation',
        aggregation: resetOnFieldChange ? defaultAggregation.value as AggregationType : this.rule().aggregation,
        column: resetOnFieldChange ? defaultColumn.value : this.rule().column,
        operator: resetOnFieldChange ? operators[0].value : this.rule().operator,
        value: resetOnFieldChange ? 0 : this.rule().value,
      });

    } else {
      const newOperators = this.queryDataService.getOperatorsForField(field.type);
      const newOperator = resetOnFieldChange ? newOperators[0].value : this.rule().operator;

      this.ruleChange.emit({
        ...this.rule(),
        field: field.value,
        operator: newOperator,
        value: resetOnFieldChange ? this.defaultValueForType(field, newOperator) : this.rule().value,
        aggregation: undefined,
        column: undefined,
        tableRuleType: undefined,
        quantifier: undefined,
        rowRules: undefined,
      });
    }
  }
  
  onTableRuleTypeChange(type: 'aggregation' | 'rowCondition') {
    const currentRule = this.rule();
    if(currentRule.tableRuleType === type) return;

    if (type === 'rowCondition' && !currentRule.rowRules) {
        this.ruleChange.emit({
            ...currentRule,
            tableRuleType: type,
            quantifier: 'all',
            rowRules: { id: `g-row-${currentRule.id}`, combinator: 'AND', rules: [] }
        });
    } else {
        this.ruleChange.emit({ ...currentRule, tableRuleType: type });
    }
  }
  
  onQuantifierChange(event: Event) {
    const quantifier = (event.target as HTMLSelectElement).value as QuantifierType;
    this.ruleChange.emit({ ...this.rule(), quantifier });
  }

  onRowRulesChange(newRowRules: RuleGroup) {
    this.ruleChange.emit({ ...this.rule(), rowRules: newRowRules });
  }

  onAggregationChange(event: Event) {
    const aggregation = (event.target as HTMLSelectElement).value as AggregationType;
    this.ruleChange.emit({ ...this.rule(), aggregation });
  }

  onColumnChange(event: Event) {
    const columnValue = (event.target as HTMLSelectElement).value;
    this.ruleChange.emit({ ...this.rule(), column: columnValue });
  }

  onOperatorChange(event: Event) {
    const operator = (event.target as HTMLSelectElement).value;
    const field = this.selectedField();
    const value = this.defaultValueForType(field, operator);
    this.ruleChange.emit({ ...this.rule(), operator, value });
  }

  onValueChange(event: Event) {
    const inputElement = event.target as HTMLInputElement | HTMLSelectElement;
    let value: any = inputElement.value;
    
    // Handle boolean specifically from select
    if (this.selectedField()?.type === 'boolean') {
        value = inputElement.value === 'true';
    } else if (inputElement instanceof HTMLInputElement && inputElement.type === 'checkbox') {
      value = inputElement.checked;
    } else if (inputElement instanceof HTMLInputElement && inputElement.type === 'number' && this.config().parseNumbers) {
      value = parseFloat(inputElement.value);
    }
    this.ruleChange.emit({ ...this.rule(), value: value });
  }

  onValueSourceChange(source: 'value' | 'field' | 'expression') {
    const currentSource = this.rule().valueSource;

    // Treat undefined as 'value' for comparison purposes
    const effectiveSource = currentSource === undefined ? 'value' : currentSource;

    if (effectiveSource === source) {
        return; // Don't emit if the source isn't actually changing
    }

    const value = source === 'expression' ? [] : undefined;
    this.ruleChange.emit({ ...this.rule(), valueSource: source, value });
  }

  onMultiSelectValueChange(event: Event) {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    const value = Array.from(selectedOptions).map(opt => opt.value);
    this.ruleChange.emit({ ...this.rule(), value });
  }

  onBetweenValueChange(event: Event, index: 0 | 1) {
    const inputElement = event.target as HTMLInputElement;
    const currentValue = Array.isArray(this.rule().value) ? [...this.rule().value] : ['', ''];
    currentValue[index] = inputElement.value;
    this.ruleChange.emit({ ...this.rule(), value: currentValue });
  }

  private defaultValueForType(field: Field | undefined, operator: string): any {
    if (!this.config().autoSelectValue || !field) return undefined;

    if (operator === 'between') {
      return field.type === 'date' ? ['', ''] : [0, 0];
    }
    if (operator === 'in' || operator === 'notIn') {
      return field.options && field.options.length > 0 ? [] : '';
    }
    switch(field.type) {
      case 'number': return 0;
      case 'boolean': return true;
      case 'select':
        return field.options?.[0]?.value ?? '';
      default: return '';
    }
  }

  onExpressionChange(tokens: ExpressionToken[]) {
    this.ruleChange.emit({ ...this.rule(), value: tokens });
  }
}
