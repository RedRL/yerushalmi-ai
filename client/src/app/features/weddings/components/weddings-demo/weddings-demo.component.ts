import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import { buildYouTubeEmbedUrl } from '../../../../shared/utils/youtube-embed.util';
import { WEDDINGS_MESSAGES } from '../../weddings.messages';

const DEMO_VIDEO_HE = '7pcjSw9pBPc';
const DEMO_VIDEO_EN = 'RgYnfu_Zk9I';

@Component({
  selector: 'app-weddings-demo',
  imports: [SectionHeadingComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weddings-demo.component.html',
  styleUrl: './weddings-demo.component.scss',
})
export class WeddingsDemoComponent {
  readonly i18n = inject(LocaleService);
  readonly msg = WEDDINGS_MESSAGES.demo;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);

  readonly videoId = computed(() => (this.i18n.isEnglish() ? DEMO_VIDEO_EN : DEMO_VIDEO_HE));
  readonly videoTitle = computed(() =>
    this.i18n.tx(this.i18n.isEnglish() ? this.msg.videoTitleEn : this.msg.videoTitleHe),
  );
  readonly posterUrl = computed(() => `https://i.ytimg.com/vi/${this.videoId()}/hqdefault.jpg`);

  readonly embedUrl = computed<SafeResourceUrl>(() => {
    const origin = isPlatformBrowser(this.platformId) ? window.location.origin : 'https://yerushalmi.ai';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      buildYouTubeEmbedUrl(this.videoId(), {
        autoplay: false,
        mute: false,
        loop: false,
        controls: true,
        origin,
      }),
    );
  });
}
