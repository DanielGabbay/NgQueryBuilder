import { ChangeDetectionStrategy, Component, computed, input, output, Signal, inject } from '@angular/core';
import { RuleComponent } from '../rule/rule.component';
import { isRuleGroup, Rule, RuleGroup } from '../../models/query-builder.models';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { TranslationService } from '../../services/translation.service';
import { AppConfig } from '../../app.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QueryBuilderComponent, RuleComponent, DragDropModule, IconComponent],
})
export class QueryBuilderComponent {
  group = input.required<RuleGroup>();
  config = input.required<AppConfig>();
  level = input<number>(0);
  queryChange = output<RuleGroup>();

  private translationService = inject(TranslationService);
  t = this.translationService.t;

  isRuleGroup = isRuleGroup;

  isRoot: Signal<boolean> = computed(() => this.level() === 0);
  
  containerClasses: Signal<string> = computed(() => {
    const level = this.level();
    if (level === 0) {
      return ''; // Root container inherits background from app.component
    }
    return 'bg-black/5 dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded-lg';
  });
  
  branchClasses = computed(() => {
    const style = 'border-gray-400 dark:border-gray-600';
    if (!this.config().showBranches) return 'border-transparent';
    return style;
  });

  combinators = computed(() => [
    { value: 'AND', label: this.t().and },
    { value: 'OR', label: this.t().or },
  ]);
  
  private idCounter = 0;
  private newId = () => `${new Date().getTime()}${this.idCounter++}`;

  addRule() {
    const newRule: Rule = {
      id: `r-${this.newId()}`,
      field: this.config().autoSelectField ? 'firstName' : '',
      operator: this.config().autoSelectOperator ? '=' : '',
      value: this.config().autoSelectValue ? '' : undefined,
    };
    const rules = [...this.group().rules, newRule];
    // Fix: Explicitly type `combinators` to prevent type widening to `string[]`.
    const combinators: ('AND' | 'OR')[] = this.group().rules.length > 0 ? [...(this.group().combinators ?? []), 'AND'] : [];
    
    this.queryChange.emit({ ...this.group(), rules, combinators });
  }

  addGroup() {
    const newGroup: RuleGroup = {
      id: `g-${this.newId()}`,
      combinator: 'AND',
      rules: this.config().addRuleToNewGroups ? [{ id: `r-${this.newId()}`, field: 'firstName', operator: '=', value: 'New' }] : [],
    };
    const rules = [...this.group().rules, newGroup];
    // Fix: Explicitly type `combinators` to prevent type widening to `string[]`.
    const combinators: ('AND' | 'OR')[] = this.group().rules.length > 0 ? [...(this.group().combinators ?? []), 'AND'] : [];
    this.queryChange.emit({ ...this.group(), rules, combinators });
  }

  removeRule(ruleToRemove: Rule | RuleGroup, index: number) {
    const rules = this.group().rules.filter(r => r.id !== ruleToRemove.id);
    const combinators = [...(this.group().combinators ?? [])];
    if (rules.length > 0 && index > 0) {
        combinators.splice(index-1, 1);
    } else if (rules.length > 0 && index === 0) {
        combinators.splice(0, 1);
    } else if (rules.length === 0) {
        combinators.splice(0);
    }
    
    this.queryChange.emit({ ...this.group(), rules, combinators });
  }

  updateRule(updatedRule: Rule | RuleGroup, index: number) {
    const rules = [...this.group().rules];
    rules[index] = updatedRule;
    this.queryChange.emit({ ...this.group(), rules });
  }

  onCombinatorChange(event: Event) {
    const newCombinator = (event.target as HTMLSelectElement).value as 'AND' | 'OR';
    this.queryChange.emit({ ...this.group(), combinator: newCombinator });
  }

  onIndependentCombinatorChange(event: Event, index: number) {
    const newCombinator = (event.target as HTMLSelectElement).value as 'AND' | 'OR';
    const combinators = [...(this.group().combinators ?? [])];
    combinators[index] = newCombinator;
    this.queryChange.emit({ ...this.group(), combinators });
  }

  drop(event: CdkDragDrop<(Rule | RuleGroup)[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const rules = [...this.group().rules];
    moveItemInArray(rules, event.previousIndex, event.currentIndex);
    
    const combinators = [...(this.group().combinators ?? [])];
    if (combinators.length > 0) {
      const movedCombinator = combinators.splice(event.previousIndex - 1, 1)[0];
      if (movedCombinator) {
        combinators.splice(event.currentIndex -1, 0, movedCombinator);
      }
    }
    
    this.queryChange.emit({ ...this.group(), rules, combinators });
  }

  cloneRule(itemToClone: Rule | RuleGroup, index: number) {
    const deepClone = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        const clone = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                (clone as any)[key] = deepClone(obj[key]);
            }
        }
        return clone;
    };
    
    const newIdRecursive = (item: Rule | RuleGroup) => {
        item.id = `${item.id.charAt(0)}-${this.newId()}`;
        if (isRuleGroup(item)) {
            item.rules.forEach(newIdRecursive);
        }
    };
    
    const newItem = deepClone(itemToClone);
    newIdRecursive(newItem);
    
    const rules = [...this.group().rules];
    rules.splice(index + 1, 0, newItem);
    const combinators = [...(this.group().combinators ?? [])];
    combinators.splice(index, 0, 'AND');
    
    this.queryChange.emit({ ...this.group(), rules, combinators });
  }

  toggleLock(itemToToggle: Rule | RuleGroup) {
    const currentGroup = this.group();
    
    // Case 1: Toggling the lock on the component's own group
    if (itemToToggle === currentGroup) {
      this.queryChange.emit({ 
        ...currentGroup, 
        locked: !currentGroup.locked 
      });
      return;
    }
  
    // Case 2: Toggling the lock on a rule or subgroup within this group's rules array
    const newRules = currentGroup.rules.map(rule => {
      if (rule === itemToToggle) {
        // Create a new object for the matched rule with the toggled 'locked' property
        return { ...rule, locked: !rule.locked };
      }
      // Return all other rules unchanged
      return rule;
    });
  
    // Emit the change with a new group object containing the new rules array
    this.queryChange.emit({ ...currentGroup, rules: newRules });
  }

  toggleNot() {
    const group = this.group();
    this.queryChange.emit({ ...group, not: !group.not });
  }

  shiftRule(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.group().rules.length) return;
    
    const rules = [...this.group().rules];
    moveItemInArray(rules, index, newIndex);
    
    const combinators = [...(this.group().combinators ?? [])];
    if(combinators.length > 0 && index > 0 && newIndex > 0) {
        moveItemInArray(combinators, index - 1, newIndex - 1);
    }

    this.queryChange.emit({ ...this.group(), rules, combinators });
  }
}
