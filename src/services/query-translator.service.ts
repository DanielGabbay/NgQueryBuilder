import { Injectable, inject } from '@angular/core';
import { isRuleGroup, Rule, RuleGroup, ValidationRule } from '../models/query-builder.models';
import { QueryDataService } from './query-data.service';
import { TranslationService } from './translation.service';

@Injectable({ providedIn: 'root' })
export class QueryTranslatorService {
  private queryDataService = inject(QueryDataService);
  private translationService = inject(TranslationService);

  // This is a placeholder as the main app component no longer consumes this service's output directly.
  // In a real app, this would be driven by the config.
  private listsAsArrays = false; 

  translate(group: RuleGroup): ValidationRule {
    const { rule, description } = this.translateGroup(group, true);
    return {
      rule,
      description,
      type: 'required' // Default type for now
    };
  }

  private translateGroup(group: RuleGroup, isRoot = false): { rule: string, description: string } {
    if (group.rules.length === 0) {
      return { rule: '', description: '' };
    }
    
    const t = this.translationService.t();

    const ruleParts = group.rules.map(r => isRuleGroup(r) ? this.translateGroup(r).rule : this.translateRule(r).rule);
    const descParts = group.rules.map(r => isRuleGroup(r) ? this.translateGroup(r).description : this.translateRule(r).description);
    
    let rule: string;
    let description: string;
    
    // Handle independent combinators
    if (group.combinators && group.combinators.length > 0) {
        rule = ruleParts.reduce((acc, part, i) => i === 0 ? part : `${acc} ${group.combinators![i-1]} ${part}`, '');
        description = descParts.reduce((acc, part, i) => {
            if (i === 0) return part;
            const combinator = group.combinators![i-1] === 'AND' ? t.translatorAnd : t.translatorOr;
            return `${acc} ${combinator} ${part}`;
        }, '');
    } else { // Handle single group combinator
        const combinatorRule = ` ${group.combinator} `;
        const combinatorDesc = ` ${group.combinator === 'AND' ? t.translatorAnd : t.translatorOr} `;
        rule = ruleParts.join(combinatorRule);
        description = descParts.join(combinatorDesc);
    }
    
    if (!isRoot) {
      rule = `(${rule})`;
      description = `(${description})`;
    }

    if (group.not) {
        rule = `NOT ${rule}`;
        description = `${t.not} ${description}`;
    }

    return { rule, description };
  }

  private translateRule(rule: Rule): { rule: string, description: string } {
    const operatorLabel = rule.operator; // For now, use the value

    let ruleString = '';
    let descriptionString = '';
    const t = this.translationService.t();
    
    if (rule.aggregation && rule.column) {
      const field = this.queryDataService.fields().find(f => f.value === rule.field);
      const columnLabel = this.getColumnLabel(rule.field, rule.column);
      
      const aggText = t[('agg' + rule.aggregation.charAt(0).toUpperCase() + rule.aggregation.slice(1)) as keyof typeof t] || rule.aggregation;
      
      ruleString = `${rule.aggregation}(${rule.field}.${rule.column}) ${operatorLabel} ${this.formatValue(rule.value, rule.operator, true)}`;
      descriptionString = `${aggText}${t.translatorOf}${columnLabel}${t.translatorIn}${field?.label} ${operatorLabel} ${this.formatValue(rule.value, rule.operator, false)}`;

    } else {
      const fieldLabel = this.getFieldLabel(rule.field);
      ruleString = `${rule.field} ${operatorLabel} ${this.formatValue(rule.value, rule.operator, true)}`;
      descriptionString = `${fieldLabel} ${operatorLabel} ${this.formatValue(rule.value, rule.operator, false)}`;
    }
    
    return { rule: ruleString, description: descriptionString };
  }
  
  private formatValue(value: any, operator: string, forRule = true): string {
    if (Array.isArray(value)) {
        return `(${value.map(v => this.formatValue(v, operator, forRule)).join(', ')})`;
    }
    if (typeof value === 'string' && forRule) {
      if (operator === 'in' || operator === 'notIn') {
        const arr = value.split(',').map(s => s.trim());
        return this.listsAsArrays ? `[${arr.map(v => `'${v}'`).join(', ')}]` : `(${arr.map(v => `'${v}'`).join(', ')})`;
      }
      return `'${value}'`;
    }
    if (value === null || value === undefined) {
        return 'NULL';
    }
    return value.toString();
  }
  
  private getFieldLabel(fieldValue: string): string {
    return this.queryDataService.fields().find(f => f.value === fieldValue)?.label ?? fieldValue;
  }
  
  private getColumnLabel(tableValue: string, columnValue: string): string {
    return this.queryDataService.getColumnsForTable(tableValue).find(c => c.value === columnValue)?.label ?? columnValue;
  }
}