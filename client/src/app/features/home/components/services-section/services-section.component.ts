import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import type { ServiceIconId } from '../../../../shared/models/service-item.model';
import { scrollToConfigurator } from '../../../../shared/utils/scroll-to.util';
import { HOME_MESSAGES } from '../../home.messages';

/** Localized service card, resolved for the active locale. */
interface ServiceView {
  id: string;
  icon: ServiceIconId;
  title: string;
  description: string;
}

/** Icon per service id (icons are not locale-dependent, so they live outside HOME_MESSAGES). */
const SERVICE_ICONS: Readonly<Record<string, ServiceIconId>> = {
  'song-only': 'song',
  'video-existing-song': 'video-existing-song',
  'video-new-song': 'video-new-song',
  'video-photos': 'photos',
  'video-ai': 'ai-visual',
};

const HIGHLIGHTED_ID = 'video-new-song';

@Component({
  selector: 'app-services-section',
  imports: [SectionHeadingComponent, RevealOnScrollDirective, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss',
})
export class ServicesSectionComponent {
  readonly i18n = inject(LocaleService);
  readonly msg = HOME_MESSAGES.services;

  private readonly services = computed<readonly ServiceView[]>(() =>
    this.msg.items.map((item) => ({
      id: item.id,
      icon: SERVICE_ICONS[item.id] ?? 'ai-visual',
      title: this.i18n.tx(item.title),
      description: this.i18n.tx(item.description),
    })),
  );

  readonly highlighted = computed<ServiceView>(() => {
    const all = this.services();
    return all.find((service) => service.id === HIGHLIGHTED_ID) ?? all[0];
  });

  readonly supporting = computed<readonly ServiceView[]>(() =>
    this.services().filter((service) => service.id !== HIGHLIGHTED_ID),
  );

  goToConfigurator(): void {
    scrollToConfigurator();
  }
}
