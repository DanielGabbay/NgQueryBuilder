import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QueryBuilderConfig } from '../../models/config.interface';

export interface ConfigOption {
    key: keyof QueryBuilderConfig;
    label: string;
    info: string;
}

@Component({
  selector: 'ngqb-options-panel',
  templateUrl: './options-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsPanelComponent {
  config = input.required<QueryBuilderConfig>();
  theme = input.required<'dark' | 'light'>();
  configOptions = input.required<ConfigOption[]>();
  t = input.required<any>();

  configChange = output<{ key: keyof QueryBuilderConfig, checked: boolean }>();
  themeChange = output<void>();

  updateConfig(key: keyof QueryBuilderConfig, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.configChange.emit({ key, checked });
  }

  toggleTheme() {
    this.themeChange.emit();
  }
}
