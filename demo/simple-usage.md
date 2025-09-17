# Simple Usage Example

Here's a minimal example of how to use the NgQueryBuilder library:

## 1. Install the library

```bash
npm install ng-query-builder
```

## 2. Basic component setup

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { 
  QueryBuilderComponent, 
  QueryBuilderConfig, 
  DEFAULT_QUERY_BUILDER_CONFIG,
  RuleGroup,
  Field 
} from 'ng-query-builder';

@Component({
  selector: 'app-root',
  imports: [QueryBuilderComponent],
  template: `
    <div class="p-4">
      <h1>My Query Builder</h1>
      <ngqb-query-builder 
        [group]="query"
        [config]="config"
        [fields]="fields"
        (queryChange)="onQueryChange($event)">
      </ngqb-query-builder>
      
      <div class="mt-4">
        <h2>Current Query:</h2>
        <pre>{{ query | json }}</pre>
      </div>
    </div>
  `
})
export class AppComponent {
  config: QueryBuilderConfig = DEFAULT_QUERY_BUILDER_CONFIG;
  
  fields: Field[] = [
    { value: 'name', label: 'Name', type: 'string' },
    { value: 'age', label: 'Age', type: 'number' },
    { value: 'email', label: 'Email', type: 'string' },
    { value: 'active', label: 'Active', type: 'boolean' }
  ];

  query: RuleGroup = {
    id: 'root',
    combinator: 'AND',
    rules: [
      {
        id: 'r1',
        field: 'name',
        operator: 'contains',
        value: ''
      }
    ]
  };

  onQueryChange(newQuery: RuleGroup) {
    this.query = newQuery;
    console.log('Query updated:', newQuery);
  }
}
```

## 3. Add Tailwind CSS

Add to your `styles.css` or include Tailwind CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Or use CDN in your `index.html`:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class'
  }
</script>
```

That's it! You now have a working query builder.