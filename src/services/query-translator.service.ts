import { Injectable, inject } from '@angular/core';
import { isRuleGroup, Rule, RuleGroup, ValidationRule, ExpressionToken } from '../models/query-builder.models';
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
    const t = this.translationService.t();
    
    const field = this.queryDataService.fields().find(f => f.value === rule.field);

    if (field?.type === 'table') {
        if (rule.tableRuleType === 'rowCondition' && rule.rowRules) {
            const quantifierRule = rule.quantifier?.toUpperCase() || 'ALL';
            
            const quantifierDescKey = rule.quantifier ? ('quantifier' + rule.quantifier.charAt(0).toUpperCase() + rule.quantifier.slice(1)) : '';
            const quantifierDesc = (t as any)[quantifierDescKey] || rule.quantifier || '';

            const nestedTranslation = this.translateGroup(rule.rowRules);
            const ruleString = `${rule.field}.${quantifierRule}(row => ${nestedTranslation.rule})`;
            const descriptionString = `${quantifierDesc} ${t.rowsIn} ${field.label} ${t.match}: ${nestedTranslation.description}`;
            return { rule: ruleString, description: descriptionString };
        } else { // Aggregation
            const columnLabel = this.getColumnLabel(rule.field, rule.column || '');
            
            const aggTextKey = rule.aggregation ? ('agg' + rule.aggregation.charAt(0).toUpperCase() + rule.aggregation.slice(1)) : '';
            const aggText = (t as any)[aggTextKey] || rule.aggregation || '';

            const formattedValue = this.formatValue(rule, false);
            const ruleValue = this.formatValue(rule, true);
            
            const ruleString = `${rule.aggregation}(${rule.field}.${rule.column}) ${rule.operator} ${ruleValue}`;
            const descriptionString = `${aggText}${t.translatorOf}${columnLabel}${t.translatorIn}${field.label} ${rule.operator} ${formattedValue}`;
            return { rule: ruleString, description: descriptionString };
        }
    } else {
      const fieldLabel = this.getFieldLabel(rule.field);
      const ruleString = `${rule.field} ${rule.operator} ${this.formatValue(rule, true)}`;
      const descriptionString = `${fieldLabel} ${rule.operator} ${this.formatValue(rule, false)}`;
      return { rule: ruleString, description: descriptionString };
    }
  }
  
  private formatValue(rule: Rule, forRule = true): string {
    if (rule.valueSource === 'field') {
        return forRule ? rule.value : (this.getFieldLabel(rule.value) || rule.value);
    }
    if (rule.valueSource === 'expression') {
      const tokens = rule.value as ExpressionToken[];
      return tokens.map(token => {
        if (token.type === 'field') {
          return forRule ? token.value : this.getFieldLabel(token.value);
        }
        return token.value;
      }).join(' ');
    }
    
    const value = rule.value;
    const operator = rule.operator;

    if (Array.isArray(value)) {
        return `(${value.map(v => this.formatSingleValue(v, operator, forRule)).join(', ')})`;
    }
    
    return this.formatSingleValue(value, operator, forRule);
  }
  
  private formatSingleValue(value: any, operator: string, forRule: boolean): string {
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
  
  // FIX: Rewrote method to correctly find the label for any field (top-level or column)
  // by searching all field definitions and translating the label.
  private getFieldLabel(fieldValue: string): string {
    const fieldDef = this.queryDataService.fieldDefs.find(f => f.value === fieldValue);
    if (fieldDef) {
      const t = this.translationService.t();
      return (t as any)[fieldDef.labelKey] || fieldDef.labelKey;
    }
    return fieldValue;
  }
  
  private getColumnLabel(tableValue: string, columnValue: string): string {
    return this.queryDataService.getColumnsForTable(tableValue).find(c => c.value === columnValue)?.label ?? columnValue;
  }
}