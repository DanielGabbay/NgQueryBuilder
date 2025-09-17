import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, inject, input, InputSignal, Renderer2 } from '@angular/core';

@Component({
  selector: 'dr-icon',
  template: '',
  styles: `
    :host {
      display: inline-block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  /* ------------------------------------------  Types and Constants ------------------------------------------ */

  /* ------------------------------------------------  Inputs ------------------------------------------------ */
  public readonly icon: InputSignal<string> = input.required();

  // Duotone options
  public readonly duotoneConfig = input({
    primaryColor: '',
    secondaryColor: '',
  });
  /* ------------------------------------------ PROVIDERS / SERVICES ------------------------------------------ */
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly cdr = inject(ChangeDetectorRef);
  /* ------------------------------------------------  Outputs ------------------------------------------------ */

  /* ------------------------------------------------  Signals ------------------------------------------------ */

  /* -------------------------------------------------- Data -------------------------------------------------- */

  /* ------------------------------------------------  Constructor ------------------------------------------------ */
  constructor() {
    effect(() => {
      this.icon();
      this.duotoneConfig();
      this.applyIconClass();
    });
  }

  /* ----------------------------------------------- Lifecycle Hooks ----------------------------------------------- */

  /* ------------------------------------------------  Methods ------------------------------------------------ */
  private applyIconClass(): void {
    const iconClass = this.icon();
    this.clearIcon();
    if (iconClass) {
      const spanElement = this.renderer.createElement('span');
      const iconElement = this.renderer.createElement('i');
      const duotoneConfig = this.duotoneConfig();
      if (duotoneConfig.primaryColor) {
        spanElement.style.setProperty('--fa-primary-color', duotoneConfig.primaryColor);
      }
      if (duotoneConfig.secondaryColor) {
        spanElement.style.setProperty('--fa-secondary-color', duotoneConfig.secondaryColor);
      }
      this.renderer.setAttribute(iconElement, 'class', iconClass);
      this.renderer.appendChild(spanElement, iconElement);
      this.renderer.appendChild(this.elementRef.nativeElement, spanElement);
    }
    this.cdr.detectChanges();
  }

  private clearIcon(): void {
    const spanElement = this.elementRef.nativeElement.querySelector('span');
    if (spanElement) {
      spanElement.remove();
    }
  }
}
