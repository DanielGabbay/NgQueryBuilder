import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppConfig } from '../../app.component';

export interface ConfigOption {
    key: keyof AppConfig;
    label: string;
    info: string;
}

@Component({
  selector: 'app-options-panel',
  templateUrl: './options-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsPanelComponent {
  config = input.required<AppConfig>();
  theme = input.required<'dark' | 'light'>();
  configOptions = input.required<ConfigOption[]>();
  t = input.required<any>();

  configChange = output<{ key: keyof AppConfig, checked: boolean }>();
  themeChange = output<void>();

  updateConfig(key: keyof AppConfig, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.configChange.emit({ key, checked });
  }

  toggleTheme() {
    this.themeChange.emit();
  }
}
