import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RuleGroup, ValidationRule } from '../../models/query-builder.models';
import { QueryTranslatorService } from '../../services/query-translator.service';

@Component({
  selector: 'app-query-preview',
  templateUrl: './query-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryPreviewComponent {
  query = input.required<RuleGroup>();
  t = input.required<any>();
  
  private translator = inject(QueryTranslatorService);

  translatedQuery = computed<ValidationRule>(() => {
    return this.translator.translate(this.query());
  });
}
