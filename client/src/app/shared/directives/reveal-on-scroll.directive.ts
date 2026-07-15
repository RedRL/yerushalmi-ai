import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Adds a restrained "fade + rise" reveal when the host element scrolls into view.
 * Centralizes IntersectionObserver usage so individual components never duplicate it.
 *
 * Usage: `<div appReveal [appRevealDelay]="120">...</div>`
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly appRevealDelay = input(0);

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;
    element.classList.add('reveal');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      element.classList.add('reveal--visible');
      return;
    }

    if (this.appRevealDelay() > 0) {
      element.style.transitionDelay = `${this.appRevealDelay()}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add('reveal--visible');
            this.observer?.unobserve(element);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
