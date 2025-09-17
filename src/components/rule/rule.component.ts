import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { Rule, Field, Operator, FieldType, AggregationType } from '../../models/query-builder.models';
import { QueryDataService } from '../../services/query-data.service';
import { AppConfig } from '../../app.component';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleComponent {
  rule = input.required<Rule>();
  config = input.required<AppConfig>();
  ruleChange = output<Rule>();

  private queryDataService = inject(QueryDataService);

  // Top-level fields (including tables) for the main dropdown
  fields: Signal<Field[]> = this.queryDataService.fields;

  // The full Field object for the currently selected field in the rule
  selectedField: Signal<Field | undefined> = computed(() => {
    const ruleField = this.rule().field;
    // Find in top-level fields first
    let field = this.fields().find(f => f.value === ruleField);
    // If not found, it might be a column in a table (for initial load)
    // This part is less critical as UI flow prevents this, but good for robustness
    if (!field) {
        // This logic is complex and might not be needed if initial state is always valid
    }
    return field;
  });
  
  // Columns for the selected table, if it is a table
  tableColumns: Signal<Field[]> = computed(() => {
    const field = this.selectedField();
    if (field?.type === 'table') {
      return this.queryDataService.getColumnsForTable(field.value);
    }
    return [];
  });

  // Aggregation operators if a table is selected
  aggregationOperators: Signal<Operator[]> = this.queryDataService.aggregationOperators;

  // Regular operators for the selected field or aggregated column
  availableOperators: Signal<Operator[]> = computed(() => {
    const field = this.selectedField();
    if (!field) return [];

    if (field.type === 'table') {
      // For table aggregations, the result is numeric
      return this.queryDataService.getOperatorsForField('number');
    }
    
    return this.queryDataService.getOperatorsForField(field.type);
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
        aggregation: resetOnFieldChange ? defaultAggregation.value as AggregationType : this.rule().aggregation,
        column: resetOnFieldChange ? defaultColumn.value : this.rule().column,
        operator: resetOnFieldChange ? operators[0].value : this.rule().operator,
        value: resetOnFieldChange ? 0 : this.rule().value,
      });

    } else {
      const newOperators = this.queryDataService.getOperatorsForField(field.type);
      this.ruleChange.emit({
        ...this.rule(),
        field: field.value,
        operator: resetOnFieldChange ? newOperators[0].value : this.rule().operator,
        value: resetOnFieldChange ? this.defaultValueForType(field.type, newOperators[0].value) : this.rule().value,
        aggregation: undefined, // Clear aggregation fields
        column: undefined
      });
    }
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
    const currentType = this.selectedField()?.type;
    const value = this.defaultValueForType(currentType, operator);
    this.ruleChange.emit({ ...this.rule(), operator, value });
  }

  onValueChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value: any = inputElement.value;
    
    // Handle boolean specifically from select
    if (this.selectedField()?.type === 'boolean') {
        value = inputElement.value === 'true';
    } else if (inputElement.type === 'checkbox') {
      value = inputElement.checked;
    } else if (inputElement.type === 'number' && this.config().parseNumbers) {
      value = parseFloat(inputElement.value);
    }
    this.ruleChange.emit({ ...this.rule(), value: value });
  }

  onBetweenValueChange(event: Event, index: 0 | 1) {
    const inputElement = event.target as HTMLInputElement;
    const currentValue = Array.isArray(this.rule().value) ? [...this.rule().value] : ['', ''];
    currentValue[index] = inputElement.value;
    this.ruleChange.emit({ ...this.rule(), value: currentValue });
  }

  private defaultValueForType(type: FieldType | undefined, operator: string): any {
    if (!this.config().autoSelectValue) return undefined;

    if (operator === 'between') {
      return type === 'date' ? ['', ''] : [0, 0];
    }
    if (operator === 'in' || operator === 'notIn') {
      return '';
    }
    switch(type) {
      case 'number': return 0;
      case 'boolean': return true;
      default: return '';
    }
  }
}