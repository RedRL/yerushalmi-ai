import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface LengthChoice {
  id: string;
  labelHe: string;
  price: number;
}

@Component({
  selector: 'app-length-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './length-slider.component.html',
  styleUrl: './length-slider.component.scss',
})
export class LengthSliderComponent {
  readonly options = input.required<readonly LengthChoice[]>();
  readonly value = input('');
  readonly selected = output<string>();

  index(): number {
    const current = this.options().findIndex((option) => option.id === this.value());
    return current < 0 ? 0 : current;
  }

  current(): LengthChoice | undefined {
    return this.options()[this.index()];
  }

  onInput(event: Event): void {
    const index = Number((event.target as HTMLInputElement).value);
    const option = this.options()[index];
    if (option) this.selected.emit(option.id);
  }
}
