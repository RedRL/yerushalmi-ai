import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';



import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';



import { PriceSummaryComponent } from '../../shared/components/price-summary/price-summary.component';



import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

import { PersistentScrollbarDirective } from '../../shared/directives/persistent-scrollbar.directive';
import { scrollToConfiguratorProgress } from '../../shared/utils/scroll-to.util';



import { ConfiguratorProgressComponent } from './components/configurator-progress/configurator-progress.component';



import { ProductStepComponent } from './components/steps/product-step/product-step.component';



import { SongStepComponent } from './components/steps/song-step/song-step.component';



import { VideoStepComponent } from './components/steps/video-step/video-step.component';



import { ProjectDetailsStepComponent } from './components/steps/project-details-step/project-details-step.component';



import { OptionalDetailsStepComponent } from './components/steps/optional-details-step/optional-details-step.component';



import { UploadStepComponent } from './components/steps/upload-step/upload-step.component';



import { SummaryStepComponent } from './components/steps/summary-step/summary-step.component';



import { ContactStepComponent } from './components/steps/contact-step/contact-step.component';



import { ConfiguratorStoreService } from './state/configurator-store.service';







@Component({



  selector: 'app-configurator',



  imports: [



    SectionHeadingComponent,



    PriceSummaryComponent,



    RevealOnScrollDirective,

    PersistentScrollbarDirective,



    ConfiguratorProgressComponent,



    ProductStepComponent,



    SongStepComponent,



    VideoStepComponent,



    ProjectDetailsStepComponent,



    OptionalDetailsStepComponent,



    UploadStepComponent,



    SummaryStepComponent,



    ContactStepComponent,



  ],



  changeDetection: ChangeDetectionStrategy.OnPush,



  templateUrl: './configurator.component.html',



  styleUrl: './configurator.component.scss',



})



export class ConfiguratorComponent {

  private static readonly MOBILE_HINT_FADE_MS = 200;

  readonly nextHintVisible = signal(false);
  readonly mobileFormExpanded = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly configuratorBody = viewChild<ElementRef<HTMLElement>>('configuratorBody');
  private readonly navNextWrap = viewChild<ElementRef<HTMLElement>>('navNextWrap');
  private readonly navTooltip = viewChild<ElementRef<HTMLElement>>('navTooltip');
  private nextHintTimer: ReturnType<typeof setTimeout> | null = null;
  private nextHintFadeTimer: ReturnType<typeof setTimeout> | null = null;
  private tooltipReturnHost: HTMLElement | null = null;

  constructor(readonly store: ConfiguratorStoreService) {
    effect(() => {
      this.store.currentStepIndex();
      this.dismissMobileNextHint(true);
      this.resetBodyScroll();
    });

    effect(() => {
      if (!this.store.submitResult()) return;
      this.resetBodyScroll();
      queueMicrotask(() => scrollToConfiguratorProgress());
    });

    effect(() => {
      this.store.isCurrentStepValid();
      this.dismissMobileNextHint(true);
    });

    this.destroyRef.onDestroy(() => {
      this.dismissMobileNextHint(true);
    });

    afterNextRender(() => this.bindMobileFormExpansion());
  }

  private bindMobileFormExpansion(): void {
    const sync = (): void => this.syncMobileFormExpanded();
    sync();

    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
    });
  }

  private syncMobileFormExpanded(): void {
    if (!window.matchMedia('(max-width: 1023px)').matches) {
      if (this.mobileFormExpanded()) this.mobileFormExpanded.set(false);
      return;
    }

    const eyebrow = this.host.nativeElement.querySelector('.section-heading__eyebrow');
    if (!(eyebrow instanceof HTMLElement)) return;

    const headerHeight = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    ) || 76;
    const scrolledPastEyebrow = eyebrow.getBoundingClientRect().bottom <= headerHeight + 8;
    if (this.mobileFormExpanded() !== scrolledPastEyebrow) {
      this.mobileFormExpanded.set(scrolledPastEyebrow);
    }
  }

  private resetBodyScroll(): void {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        const body = this.configuratorBody()?.nativeElement;
        if (body) {
          body.scrollTop = 0;
        }
      });
    });
  }







  get isFinalStep(): boolean {



    return this.store.currentStep().id === 'contact';



  }







  get isFirstStep(): boolean {



    return this.store.currentStepIndex() === 0;



  }







  get showSidebarPrice(): boolean {
    return !this.store.submitResult() && !!this.store.mainProduct();
  }

  get showInlinePrice(): boolean {
    return this.showSidebarPrice && !!this.store.priceBreakdown();
  }

  get showIntroPricing(): boolean {
    const intro = this.store.priceBreakdown()?.total;
    const original = this.store.originalPriceTotal();
    return intro != null && original != null && original > intro;
  }







  goNext(): void {
    this.dismissMobileNextHint(true);
    this.store.goNext();
  }

  onNextWrapClick(): void {
    if (!this.store.isCurrentStepValid() && window.matchMedia('(max-width: 1023px)').matches) {
      this.showMobileNextHint();
    }
  }

  private showMobileNextHint(): void {
    this.clearNextHintTimer();

    requestAnimationFrame(() => {
      if (!this.applyMobileTooltipPosition()) {
        return;
      }

      if (!this.nextHintVisible()) {
        requestAnimationFrame(() => this.nextHintVisible.set(true));
      }

      this.nextHintTimer = setTimeout(() => this.hideMobileNextHint(), 3000);
    });
  }

  private hideMobileNextHint(): void {
    if (!this.nextHintVisible()) {
      this.clearMobileTooltipPosition();
      this.nextHintTimer = null;
      return;
    }

    this.nextHintVisible.set(false);
    this.nextHintTimer = null;
    this.nextHintFadeTimer = setTimeout(() => {
      this.clearMobileTooltipPosition();
      this.nextHintFadeTimer = null;
    }, ConfiguratorComponent.MOBILE_HINT_FADE_MS);
  }

  private dismissMobileNextHint(immediate = false): void {
    this.clearNextHintTimer();
    this.nextHintVisible.set(false);

    if (immediate) {
      this.clearMobileTooltipPosition();
      return;
    }

    this.nextHintFadeTimer = setTimeout(() => {
      this.clearMobileTooltipPosition();
      this.nextHintFadeTimer = null;
    }, ConfiguratorComponent.MOBILE_HINT_FADE_MS);
  }

  private clearNextHintTimer(): void {
    if (this.nextHintTimer !== null) {
      clearTimeout(this.nextHintTimer);
      this.nextHintTimer = null;
    }

    if (this.nextHintFadeTimer !== null) {
      clearTimeout(this.nextHintFadeTimer);
      this.nextHintFadeTimer = null;
    }
  }

  private applyMobileTooltipPosition(): boolean {
    if (!window.matchMedia('(max-width: 1023px)').matches) {
      return false;
    }

    const wrap = this.navNextWrap()?.nativeElement;
    const tooltip = this.navTooltip()?.nativeElement;
    if (!wrap || !tooltip) {
      return false;
    }

    if (tooltip.parentElement !== document.body) {
      this.tooltipReturnHost = wrap;
      document.body.appendChild(tooltip);
    }

    const rect = wrap.getBoundingClientRect();
    const gap = 8;
    tooltip.style.setProperty('position', 'fixed');
    tooltip.style.setProperty('left', '50%');
    tooltip.style.setProperty('right', 'auto');
    tooltip.style.setProperty('top', `${Math.max(8, rect.top - gap)}px`);
    tooltip.style.setProperty('bottom', 'auto');
    tooltip.style.setProperty('transform', 'translate(-50%, -100%)');
    tooltip.style.setProperty('z-index', '1000');
    return true;
  }

  private clearMobileTooltipPosition(): void {
    this.restoreMobileTooltip();

    const tooltip = this.navTooltip()?.nativeElement;
    if (!tooltip) {
      return;
    }

    tooltip.style.removeProperty('position');
    tooltip.style.removeProperty('left');
    tooltip.style.removeProperty('right');
    tooltip.style.removeProperty('top');
    tooltip.style.removeProperty('bottom');
    tooltip.style.removeProperty('transform');
    tooltip.style.removeProperty('z-index');
  }

  private restoreMobileTooltip(): void {
    const tooltip = this.navTooltip()?.nativeElement;
    if (!tooltip || !this.tooltipReturnHost) {
      return;
    }

    if (tooltip.parentElement === document.body) {
      this.tooltipReturnHost.appendChild(tooltip);
    }

    this.tooltipReturnHost = null;
  }

  onNextButtonClick(event: Event): void {
    if (this.store.isCurrentStepValid()) {
      event.stopPropagation();
      this.goNext();
    }
  }







  goBack(): void {
    this.store.goBack();
  }

  submitContact(): void {
    if (this.store.isSubmitting() || this.store.submitResult()) return;
    if (!this.store.isSubmissionValid()) {
      this.store.contactForm.markAllAsTouched();
      return;
    }
    void this.store.submit();
  }
}



