import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Rule, Field } from '../../models/query-builder.models';
import { QueryBuilderConfig } from '../../models/config.interface';

@Component({
  selector: 'ngqb-rule-value-input',
  templateUrl: './rule-value-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleValueInputComponent {
  rule = input.required<Rule>();
  field = input.required<Field | undefined>();
  config = input.required<QueryBuilderConfig>();

  valueChange = output<any>();

  onValueChange(event: Event) {
    const inputElement = event.target as HTMLInputElement | HTMLSelectElement;
    let value: any = inputElement.value;
    
    if (this.field()?.type === 'boolean') {
      if (inputElement instanceof HTMLInputElement && inputElement.type === 'checkbox') {
        value = inputElement.checked;
      } else {
        value = inputElement.value === 'true';
      }
    } else if (inputElement instanceof HTMLInputElement && inputElement.type === 'number' && this.config().parseNumbers) {
      value = parseFloat(inputElement.value);
    }
    this.valueChange.emit(value);
  }
  
  onMultiSelectValueChange(event: Event) {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    const value = Array.from(selectedOptions).map(opt => opt.value);
    this.valueChange.emit(value);
  }

  onBetweenValueChange(event: Event, index: 0 | 1) {
    const inputElement = event.target as HTMLInputElement;
    const currentValue = Array.isArray(this.rule().value) ? [...this.rule().value] : ['', ''];
    let value: string | number = inputElement.value;
    if (inputElement.type === 'number' && this.config().parseNumbers) {
        value = parseFloat(inputElement.value);
    }
    currentValue[index] = value;
    this.valueChange.emit(currentValue);
  }
}
