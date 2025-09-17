import { ChangeDetectionStrategy, Component, signal, WritableSignal, inject, Renderer2, effect, computed } from '@angular/core';
import { QueryBuilderComponent } from './components/query-builder/query-builder.component';
import { Rule, RuleGroup } from './models/query-builder.models';
import { TranslationService, Language } from './services/translation.service';
import { OptionsPanelComponent } from './components/options-panel/options-panel.component';
import { QueryPreviewComponent } from './components/query-preview/query-preview.component';
import { localSignal } from './utils/local-signal';

export interface AppConfig {
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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QueryBuilderComponent, OptionsPanelComponent, QueryPreviewComponent],
})
export class AppComponent {
  translationService = inject(TranslationService);
  t = this.translationService.t;
  private renderer = inject(Renderer2);
  
  theme = localSignal<'dark' | 'light'>('dark', 'query-builder-theme');

  initialQuery: RuleGroup = {
    id: 'root',
    combinator: 'AND',
    rules: [
      // Part 1: All rows must have a valid calculation for totalAfterDiscount
      // Corresponds to: items.All(item => item.totalAfterDiscount == (item.unitPrice - item.discountPerUnit) * item.qty)
      {
        id: 'r-row-condition',
        field: 'prod1', // The item table
        operator: '',
        value: null,
        tableRuleType: 'rowCondition',
        quantifier: 'all', // "items.All(...)"
        rowRules: {
          id: 'g-row-rules',
          combinator: 'AND',
          rules: [
            // Interactive formula builder rule
            {
              id: 'rr-formula-check',
              field: 'totalAfterDiscount',
              operator: '==',
              valueSource: 'expression',
              value: [
                { type: 'paren', value: '(' },
                { type: 'field', value: 'unit_price' },
                { type: 'operator', value: '-' },
                { type: 'field', value: 'discountPerUnit' },
                { type: 'paren', value: ')' },
                { type: 'operator', value: '*' },
                { type: 'field', value: 'qty' },
              ]
            },
          ],
          combinators: []
        }
      },
      // Part 2: The sum of totals must match the invoice total
      // Corresponds to: items.Sum(item => item.totalAfterDiscount) == invoice.totalSum
      {
        id: 'r-aggregation',
        field: 'prod1', // The item table
        tableRuleType: 'aggregation',
        aggregation: 'sum',
        column: 'totalAfterDiscount',
        operator: '=',
        value: 'invoiceTotalSum',
        valueSource: 'field'
      }
    ],
    combinators: ['AND'] // For the 2 main rules
  };

  private readonly initialConfig: AppConfig = {
    addRuleToNewGroups: false,
    autoSelectField: true,
    autoSelectOperator: true,
    autoSelectValue: false,
    combinatorsBetweenRules: true,
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
    showShiftActions: false, // Disabled to simplify UI
    showQueryPreview: true,
    suppressStandardClasses: false,
    useDateTimePackage: true,
    useValidation: true,
  };

  config: WritableSignal<AppConfig> = localSignal<AppConfig>(this.initialConfig, 'query-builder-config');
  
  configOptions = computed(() => {
    const translations = this.t();
    return (Object.keys(this.initialConfig) as (keyof AppConfig)[]).map(key => {
        const labelKey = key as keyof typeof translations;
        const infoKey = `${key}Info` as keyof typeof translations;
        return {
            key: key,
            label: translations[labelKey] || key,
            info: translations[infoKey] || ''
        };
    });
  });

  query: WritableSignal<RuleGroup> = signal(this.initialQuery);
  
  constructor() {
    effect(() => {
      const lang = this.translationService.currentLang();
      this.renderer.setAttribute(document.documentElement, 'lang', lang);
      this.renderer.setAttribute(document.documentElement, 'dir', lang === 'he' ? 'rtl' : 'ltr');
    });

    effect(() => {
        if (this.theme() === 'dark') {
            this.renderer.addClass(document.documentElement, 'dark');
        } else {
            this.renderer.removeClass(document.documentElement, 'dark');
        }
    });
  }

  onConfigChange({ key, checked }: { key: keyof AppConfig, checked: boolean }) {
    this.config.update(c => ({ ...c, [key]: checked }));
  }

  onThemeChange() {
    this.theme.update(current => current === 'dark' ? 'light' : 'dark');
  }
  
  onLanguageChange(lang: Language) {
    this.translationService.setLanguage(lang);
  }

  onQueryChange(updatedQuery: RuleGroup) {
    this.query.set(updatedQuery);
  }
}