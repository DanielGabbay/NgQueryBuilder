import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ExpressionToken, Field, Operator } from '../../models/query-builder.models';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-expression-builder',
  templateUrl: './expression-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpressionBuilderComponent {
  expression = input.required<(ExpressionToken)[]>();
  fields = input.required<Field[]>();
  arithmeticOperators = input.required<Operator[]>();

  expressionChange = output<ExpressionToken[]>();

  private translationService = inject(TranslationService);
  t = this.translationService.t;

  addToken(type: 'field' | 'operator' | 'paren', value: string) {
    const currentTokens = this.expression();
    const newToken: ExpressionToken = { type, value };
    this.expressionChange.emit([...currentTokens, newToken]);
  }

  removeToken(index: number) {
    const currentTokens = [...this.expression()];
    currentTokens.splice(index, 1);
    this.expressionChange.emit(currentTokens);
  }

  getTokenLabel(token: ExpressionToken): string {
    if (token.type === 'field') {
      return this.fields().find(f => f.value === token.value)?.label ?? token.value;
    }
    return token.value;
  }
}
