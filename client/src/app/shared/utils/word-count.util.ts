import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function maxWordsValidator(maxWords: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const count = countWords(String(control.value ?? ''));
    return count > maxWords ? { maxWords: { max: maxWords, actual: count } } : null;
  };
}
