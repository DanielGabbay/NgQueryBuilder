# NgQueryBuilder

A dynamic and recursive query builder library for Angular applications. This workspace contains both the npm-publishable library and a demo application showcasing its capabilities.

![Angular](https://img.shields.io/badge/Angular-20%2B-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Quick Start

### Using the Library

```bash
npm install ng-query-builder
```

```typescript
import { QueryBuilderComponent, DEFAULT_QUERY_BUILDER_CONFIG } from 'ng-query-builder';

@Component({
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
export class MyComponent {
  config = DEFAULT_QUERY_BUILDER_CONFIG;
  fields = [
    { value: 'name', label: 'Name', type: 'string' },
    { value: 'age', label: 'Age', type: 'number' }
  ];
  query = { id: 'root', combinator: 'AND', rules: [] };
  
  onQueryChange(newQuery) {
    console.log('Query:', newQuery);
  }
}
```

## ✨ Library Features

- **🔧 Dynamic Rule Building**: Create complex nested rule structures
- **🎯 Multiple Field Types**: String, Number, Boolean, Date, Select, Table
- **🔄 Drag & Drop**: Intuitive reordering of rules and groups
- **🌐 Internationalization**: English and Hebrew support built-in
- **🎨 Theming**: Dark/Light mode with Tailwind CSS
- **✅ Validation**: Comprehensive rule validation
- **📊 Aggregations**: Table aggregations (sum, count, avg, min, max)
- **🔀 Expressions**: Mathematical expression builder
- **📝 Query Translation**: Export to human-readable format
- **⚡ Performance**: OnPush change detection

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start demo application |
| `npm run build` | Build demo application |
| `npm run build:lib` | Build library for npm |
| `npm run pack:lib` | Package library as .tgz |
| `npm run publish:lib` | Build and publish to npm |

## 📖 Documentation

- **[Library README](projects/ng-query-builder/README.md)**: Complete API documentation
- **[Simple Usage](demo/simple-usage.md)**: Quick start guide

## 📄 License

MIT License - see [LICENSE](projects/ng-query-builder/LICENSE) for details.

**Made with ❤️ for the Angular community**
