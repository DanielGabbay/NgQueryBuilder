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
  options?: {value: any, labelKey: string}[];
  inputType?: 'radio';
}

@Injectable({
  providedIn: 'root',
})
export class QueryDataService {
  private translationService = inject(TranslationService);
  private t = this.translationService.t;
  
  // FIX: Made fieldDefs public to be accessible from other services.
  public fieldDefs: FieldDefinition[] = [
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
        { value: 'Guitar', labelKey: 'instrumentGuitar' },
        { value: 'Piano', labelKey: 'instrumentPiano' },
        { value: 'Drums', labelKey: 'instrumentDrums' },
        { value: 'Bass', labelKey: 'instrumentBass' },
        { value: 'Violin', labelKey: 'instrumentViolin' },
      ]
    },
    {
      value: 'gender',
      labelKey: 'fieldGender',
      type: 'select',
      inputType: 'radio',
      options: [
        { value: 'Male', labelKey: 'genderMale' },
        { value: 'Female', labelKey: 'genderFemale' },
        { value: 'Other', labelKey: 'genderOther' },
      ]
    },
    { value: 'notes', labelKey: 'fieldNotes', type: 'textarea' },
    { value: 'invoiceTotalSum', labelKey: 'fieldInvoiceTotalSum', type: 'number' },
    { value: "prod1", labelKey: "fieldItemTable", type: "table" },
    { labelKey: "fieldItemName", value: "item_name", type: "string", group: "prod1", values: ["קולה", "נייר טוואלט", "חלב"] },
    { labelKey: "fieldUnitPrice", value: "unit_price", type: "number", group: "prod1" },
    { labelKey: "fieldDiscountPerUnit", value: "discountPerUnit", type: "number", group: "prod1" },
    { labelKey: "fieldQty", value: "qty", type: "number", group: "prod1" },
    { labelKey: "fieldTotalAfterDiscount", value: "totalAfterDiscount", type: "number", group: "prod1" }
  ];

  private operatorDefs: OperatorDefinition[] = [
    { value: '=', labelKey: 'opEquals' }, { value: '!=', labelKey: 'opNotEquals' },
    { value: '==', labelKey: 'opDoubleEquals' },
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
  
  private arithmeticOperatorDefs: OperatorDefinition[] = [
    { value: '+', labelKey: 'opPlus' }, { value: '-', labelKey: 'opMinus' },
    { value: '*', labelKey: 'opMultiply' }, { value: '/', labelKey: 'opDivide' },
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
  
  // FIX: Added explicit return type for better type safety.
  private translateOptions(options: {value: any, labelKey: string}[] | undefined): { value: any, label: string }[] | undefined {
      if (!options) return undefined;
      const t = this.t();
      return options.map(opt => ({...opt, label: t[opt.labelKey as keyof typeof t] || opt.labelKey}));
  }

  // FIX: Created a helper to translate a FieldDefinition to a Field, handling both top-level label and nested options labels.
  private translateField(fieldDef: FieldDefinition): Field {
    const t = this.t();
    // The spread operator `...fieldDef` correctly carries over all properties.
    // We then explicitly add the translated `label` and `options`.
    // The original `labelKey` is still present but TypeScript's structural typing
    // allows assignment to `Field` as long as all of `Field`'s properties are present and correctly typed.
    return {
      ...fieldDef,
      label: t[fieldDef.labelKey as keyof typeof t] || fieldDef.labelKey,
      options: this.translateOptions(fieldDef.options)
    };
  }

  // PUBLIC API
  fields = computed<Field[]>(() => {
    // FIX: Refactored to use the new translateField helper for consistency and to remove duplicated logic.
    return this.fieldDefs
      .filter(f => !f.group)
      .map(d => this.translateField(d));
  });
  
  aggregationOperators = computed<Operator[]>(() => this.translateDefs(this.aggregationOperatorDefs));
  arithmeticOperators = computed<Operator[]>(() => this.translateDefs(this.arithmeticOperatorDefs));
  
  // FIX: Corrected implementation to properly translate column definitions, including their `options` property, which was causing a type error. This now uses the `translateField` helper.
  getColumnsForTable(tableCode: string): Field[] {
    return this.fieldDefs
      .filter(f => f.group === tableCode)
      .map(d => this.translateField(d));
  }

  getOperatorsForField(fieldType: FieldType): Operator[] {
    const translatedOperators = this.translateDefs(this.operatorDefs);
    const nullChecks = ['isNull', 'isNotNull'];
    const comparison = ['=', '!=', '<', '>', '<=', '>=', '=='];

    switch (fieldType) {
      case 'string':
      case 'select':
      case 'textarea':
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
        return translatedOperators.filter(o => ['=', '!=', '==', 'isTrue', 'isFalse'].includes(o.value));
      case 'table':
        return translatedOperators.filter(o => 
          [...comparison, 'between', 'in', 'notIn'].includes(o.value)
        );
      default:
        return translatedOperators;
    }
  }
}