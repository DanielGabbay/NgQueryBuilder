import { Injectable, computed, inject } from '@angular/core';
import { Field, Operator, FieldType } from '../models/query-builder.models';
import { TranslationService } from './translation.service';

// Internal interfaces for data definitions before translation
interface OperatorDefinition {
  value: string;
  labelKey: string;
}
interface FieldDefinition {
  value: string;
  labelKey: string;
  type: FieldType;
  group?: string;
  values?: any[];
  options?: {value: any, label: string}[];
}

@Injectable({
  providedIn: 'root',
})
export class QueryDataService {
  private translationService = inject(TranslationService);
  private t = this.translationService.t;
  
  private fieldDefs: FieldDefinition[] = [
    { value: 'firstName', labelKey: 'fieldFirstName', type: 'string' },
    { value: 'lastName', labelKey: 'fieldLastName', type: 'string' },
    { value: 'age', labelKey: 'fieldAge', type: 'number' },
    { value: 'birthDate', labelKey: 'fieldBirthDate', type: 'date' },
    { value: 'isMusician', labelKey: 'fieldIsMusician', type: 'boolean' },
    { 
      value: 'primaryInstrument', 
      labelKey: 'fieldPrimaryInstrument', 
      type: 'select',
      options: [
        { value: 'Guitar', label: 'Guitar' },
        { value: 'Piano', label: 'Piano' },
        { value: 'Drums', label: 'Drums' },
        { value: 'Bass', label: 'Bass' },
      ]
    },
    { value: "prod1", labelKey: "fieldItemTable", type: "table" },
    { labelKey: "fieldItemName", value: "item_name", type: "string", group: "prod1", values: ["קולה", "נייר טוואלט", "חלב"] },
    { labelKey: "fieldUnitPrice", value: "unit_price", type: "number", group: "prod1", values: [10, 20, 30] },
    { labelKey: "fieldAmount", value: "amount", type: "number", group: "prod1" }
  ];

  private operatorDefs: OperatorDefinition[] = [
    { value: '=', labelKey: 'opEquals' }, { value: '!=', labelKey: 'opNotEquals' },
    { value: '<', labelKey: 'opLessThan' }, { value: '>', labelKey: 'opGreaterThan' },
    { value: '<=', labelKey: 'opLessThanOrEquals' }, { value: '>=', labelKey: 'opGreaterThanOrEquals' },
    { value: 'contains', labelKey: 'opContains' }, { value: 'startsWith', labelKey: 'opStartsWith' },
    { value: 'endsWith', labelKey: 'opEndsWith' }, { value: 'regex', labelKey: 'opRegex' },
    { value: 'between', labelKey: 'opBetween' }, { value: 'in', labelKey: 'opIn' },
    { value: 'notIn', labelKey: 'opNotIn' }, { value: 'isTrue', labelKey: 'opIsTrue' },
    { value: 'isFalse', labelKey: 'opIsFalse' }, { value: 'isNull', labelKey: 'opIsNull' },
    { value: 'isNotNull', labelKey: 'opIsNotNull' }, { value: 'isEmpty', labelKey: 'opIsEmpty' },
    { value: 'isNotEmpty', labelKey: 'opIsNotEmpty' },
  ];

  private aggregationOperatorDefs: OperatorDefinition[] = [
    { value: 'sum', labelKey: 'aggSum' }, { value: 'count', labelKey: 'aggCount' },
    { value: 'avg', labelKey: 'aggAvg' }, { value: 'min', labelKey: 'aggMin' },
    { value: 'max', labelKey: 'aggMax' },
  ];

  private translateDefs<T extends { labelKey: string }>(defs: T[]): (T & { label: string })[] {
    const t = this.t();
    return defs.map(d => ({ ...d, label: t[d.labelKey as keyof typeof t] || d.labelKey }));
  }

  // PUBLIC API
  fields = computed<Field[]>(() => {
    const t = this.t();
    return this.fieldDefs
      .filter(f => !f.group)
      .map(d => ({ 
        ...d, 
        label: t[d.labelKey as keyof typeof t] || d.labelKey,
        options: d.options?.map(opt => ({ ...opt, label: t[opt.label as keyof typeof t] || opt.label}))
      }));
  });
  
  aggregationOperators = computed<Operator[]>(() => this.translateDefs(this.aggregationOperatorDefs));
  
  getColumnsForTable(tableCode: string): Field[] {
    return this.translateDefs(this.fieldDefs.filter(f => f.group === tableCode));
  }

  getOperatorsForField(fieldType: FieldType): Operator[] {
    const translatedOperators = this.translateDefs(this.operatorDefs);
    const nullChecks = ['isNull', 'isNotNull'];
    const comparison = ['=', '!=', '<', '>', '<=', '>='];

    switch (fieldType) {
      case 'string':
      case 'select':
        return translatedOperators.filter(o => 
          [...comparison, 'contains', 'startsWith', 'endsWith', 'in', 'notIn', ...nullChecks].includes(o.value)
        );
      case 'number':
        return translatedOperators.filter(o => 
          [...comparison, 'between', 'in', 'notIn', ...nullChecks].includes(o.value)
        );
      case 'date':
        return translatedOperators.filter(o => 
          [...comparison, 'between', ...nullChecks].includes(o.value)
        );
      case 'boolean':
        return translatedOperators.filter(o => ['=', '!='].includes(o.value));
      case 'table':
        return translatedOperators.filter(o => 
          [...comparison, 'between', 'in', 'notIn'].includes(o.value)
        );
      default:
        return translatedOperators;
    }
  }
}