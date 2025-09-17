# NgQueryBuilder

A dynamic and recursive query builder component for Angular applications. Build complex validation rule sets with a user-friendly interface supporting drag-and-drop, nested groups, expressions, and comprehensive validation.

![Angular](https://img.shields.io/badge/Angular-20%2B-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## Features

- 🔧 **Dynamic Rule Building**: Create complex nested rule structures
- 🎯 **Field Types Support**: String, Number, Boolean, Date, Select, TextArea, and Table fields
- 🔄 **Drag & Drop**: Reorder rules and groups with intuitive drag-and-drop
- 🌐 **Internationalization**: Built-in support for English and Hebrew
- 🎨 **Theming**: Dark/Light mode support with Tailwind CSS
- ✅ **Validation**: Comprehensive rule validation
- 📊 **Aggregations**: Support for table aggregations (sum, count, avg, min, max)
- 🔀 **Expressions**: Mathematical expression builder
- 📝 **Query Translation**: Export rules to human-readable format
- ⚡ **Performance**: OnPush change detection for optimal performance

## Installation

```bash
npm install ng-query-builder
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install @angular/core @angular/common @angular/cdk
```

## Basic Usage

### 1. Import the Component

```typescript
import { Component } from '@angular/core';
import { 
  QueryBuilderComponent, 
  QueryBuilderConfig, 
  DEFAULT_QUERY_BUILDER_CONFIG,
  RuleGroup,
  Field 
} from 'ng-query-builder';

@Component({
  selector: 'app-example',
  imports: [QueryBuilderComponent],
  template: `
    <ngqb-query-builder 
      [group]="query"
      [config]="config"
      [fields]="fields"
      (queryChange)="onQueryChange($event)">
    </ngqb-query-builder>
  `
})
export class ExampleComponent {
  config: QueryBuilderConfig = DEFAULT_QUERY_BUILDER_CONFIG;
  
  fields: Field[] = [
    { value: 'name', label: 'Name', type: 'string' },
    { value: 'age', label: 'Age', type: 'number' },
    { value: 'active', label: 'Active', type: 'boolean' }
  ];

  query: RuleGroup = {
    id: 'root',
    combinator: 'AND',
    rules: []
  };

  onQueryChange(newQuery: RuleGroup) {
    this.query = newQuery;
    console.log('Query changed:', newQuery);
  }
}
```

### 2. Styling

The library uses Tailwind CSS classes. Make sure you have Tailwind CSS configured in your project, or include the styles manually.

## Configuration

The `QueryBuilderConfig` interface provides extensive customization options:

```typescript
interface QueryBuilderConfig {
  addRuleToNewGroups: boolean;        // Auto-add rule to new groups
  autoSelectField: boolean;           // Auto-select first field in new rules
  autoSelectOperator: boolean;        // Auto-select first operator in new rules
  autoSelectValue: boolean;           // Auto-select value in new rules
  combinatorsBetweenRules: boolean;   // Show combinators between rules
  debugMode: boolean;                 // Enable debug mode
  disabled: boolean;                  // Disable entire query builder
  dragAndDropEnabled: boolean;        // Enable drag and drop
  independentCombinators: boolean;    // Independent combinator selection
  justifiedLayout: boolean;           // Justify layout to full width
  listsAsArrays: boolean;             // Treat lists as arrays
  parseNumbers: boolean;              // Parse string numbers to numbers
  resetOnFieldChange: boolean;        // Reset rule when field changes
  showNotToggle: boolean;             // Show NOT toggle
  showBranches: boolean;              // Show connecting branches
  showCloneButtons: boolean;          // Show clone buttons
  showLockButtons: boolean;           // Show lock buttons
  showShiftActions: boolean;          // Show move up/down buttons
  showQueryPreview: boolean;          // Show query preview
  suppressStandardClasses: boolean;   // Suppress default CSS classes
  useDateTimePackage: boolean;        // Use date/time package
  useValidation: boolean;             // Enable validation
}
```

## Advanced Features

### Field Types

```typescript
const fields: Field[] = [
  // Basic field types
  { value: 'name', label: 'Name', type: 'string' },
  { value: 'age', label: 'Age', type: 'number' },
  { value: 'active', label: 'Active', type: 'boolean' },
  { value: 'birthDate', label: 'Birth Date', type: 'date' },
  
  // Select field with options
  { 
    value: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  
  // Table field for aggregations
  { 
    value: 'orders', 
    label: 'Orders', 
    type: 'table',
    // Child fields for table columns
    group: 'orders'
  }
];
```

### Table Rules and Aggregations

The library supports advanced table operations:

```typescript
// Aggregation rule example
const aggregationRule: Rule = {
  id: 'sum-rule',
  field: 'orders',                    // Table field
  tableRuleType: 'aggregation',
  aggregation: 'sum',                 // sum, count, avg, min, max
  column: 'amount',                   // Column to aggregate
  operator: '>',
  value: 1000
};

// Row condition rule example
const rowConditionRule: Rule = {
  id: 'row-rule',
  field: 'orders',                    // Table field
  tableRuleType: 'rowCondition',
  quantifier: 'any',                  // any, all, none
  rowRules: {                         // Nested rules for row conditions
    id: 'nested',
    combinator: 'AND',
    rules: [
      { id: 'r1', field: 'status', operator: '=', value: 'completed' }
    ]
  }
};
```

### Expression Builder

Enable mathematical expressions in rules:

```typescript
const expressionRule: Rule = {
  id: 'expr-rule',
  field: 'price',
  operator: '=',
  valueSource: 'expression',
  value: [
    { type: 'paren', value: '(' },
    { type: 'field', value: 'basePrice' },
    { type: 'operator', value: '*' },
    { type: 'field', value: 'quantity' },
    { type: 'paren', value: ')' },
    { type: 'operator', value: '-' },
    { type: 'field', value: 'discount' }
  ]
};
```

## Services

### Translation Service

Built-in internationalization support:

```typescript
import { TranslationService } from 'ng-query-builder';

// Inject the service
constructor(private translationService: TranslationService) {}

// Change language
this.translationService.setLanguage('he'); // Hebrew
this.translationService.setLanguage('en'); // English
```

### History Service

Undo/Redo functionality:

```typescript
import { HistoryService } from 'ng-query-builder';

constructor(private historyService: HistoryService) {}

// Initialize with starting state
this.historyService.init(initialQuery);

// Add new state
this.historyService.addState(newQuery);

// Undo/Redo
this.historyService.undo();
this.historyService.redo();

// Check availability
const canUndo = this.historyService.canUndo();
const canRedo = this.historyService.canRedo();
```

### Query Translator Service

Convert rules to human-readable format:

```typescript
import { QueryTranslatorService } from 'ng-query-builder';

constructor(private translator: QueryTranslatorService) {}

const humanReadable = this.translator.translate(query);
console.log(humanReadable.description); // Human-readable description
console.log(humanReadable.rule);        // Rule string
```

## Styling and Theming

The library uses Tailwind CSS classes and supports dark mode:

```html
<!-- Enable dark mode by adding 'dark' class to a parent element -->
<div class="dark">
  <ngqb-query-builder 
    [group]="query"
    [config]="config"
    (queryChange)="onQueryChange($event)">
  </ngqb-query-builder>
</div>
```

## Complete Example

```typescript
import { Component, computed } from '@angular/core';
import { 
  QueryBuilderComponent,
  OptionsPanelComponent,
  QueryPreviewComponent,
  QueryBuilderConfig,
  DEFAULT_QUERY_BUILDER_CONFIG,
  RuleGroup,
  Field,
  TranslationService,
  HistoryService
} from 'ng-query-builder';

@Component({
  selector: 'app-query-builder-demo',
  imports: [QueryBuilderComponent, OptionsPanelComponent, QueryPreviewComponent],
  template: `
    <div class="grid grid-cols-4 gap-4">
      <ngqb-options-panel
        class="col-span-1"
        [config]="config"
        [theme]="theme"
        [configOptions]="configOptions"
        [t]="t"
        (configChange)="onConfigChange($event)"
        (themeChange)="toggleTheme()">
      </ngqb-options-panel>
      
      <div class="col-span-3">
        <ngqb-query-builder 
          [group]="query"
          [config]="config"
          [fields]="fields"
          (queryChange)="onQueryChange($event)">
        </ngqb-query-builder>
        
        <ngqb-query-preview
          [query]="query"
          [t]="t">
        </ngqb-query-preview>
      </div>
    </div>
  `
})
export class QueryBuilderDemoComponent {
  config: QueryBuilderConfig = DEFAULT_QUERY_BUILDER_CONFIG;
  theme: 'light' | 'dark' = 'light';
  
  fields: Field[] = [
    { value: 'firstName', label: 'First Name', type: 'string' },
    { value: 'lastName', label: 'Last Name', type: 'string' },
    { value: 'age', label: 'Age', type: 'number' },
    { value: 'isActive', label: 'Is Active', type: 'boolean' },
    { 
      value: 'status', 
      label: 'Status', 
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ];

  query: RuleGroup = {
    id: 'root',
    combinator: 'AND',
    rules: [
      {
        id: 'r1',
        field: 'firstName',
        operator: 'contains',
        value: 'John'
      }
    ]
  };

  constructor(
    private translationService: TranslationService,
    private historyService: HistoryService
  ) {
    this.historyService.init(this.query);
  }

  t = this.translationService.t;
  
  configOptions = computed(() => {
    // Generate config options for the options panel
    return Object.keys(this.config).map(key => ({
      key: key as keyof QueryBuilderConfig,
      label: key,
      info: `Toggle ${key}`
    }));
  });

  onQueryChange(newQuery: RuleGroup) {
    this.query = newQuery;
    this.historyService.addState(newQuery);
  }

  onConfigChange(change: { key: keyof QueryBuilderConfig, checked: boolean }) {
    this.config = { ...this.config, [change.key]: change.checked };
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
}
```

## API Reference

### Components

- `QueryBuilderComponent` - Main query builder component
- `OptionsPanelComponent` - Configuration options panel
- `QueryPreviewComponent` - Query preview and translation

### Interfaces

- `QueryBuilderConfig` - Configuration interface
- `RuleGroup` - Rule group interface
- `Rule` - Individual rule interface
- `Field` - Field definition interface
- `Operator` - Operator interface

### Services

- `TranslationService` - Internationalization service
- `HistoryService` - Undo/redo functionality
- `QueryTranslatorService` - Query translation service
- `QueryDataService` - Data management service

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.