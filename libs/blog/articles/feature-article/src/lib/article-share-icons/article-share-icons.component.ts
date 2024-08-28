import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, computed, input, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

import { IconType } from '@angular-love/blog/shared/ui-icon';

type ShareItem = {
  href: string;
  icon: IconType;
  ariaLabel: string;
};

@Component({
  standalone: true,
  selector: 'al-article-share-icons',
  imports: [TranslocoDirective, FastSvgComponent, CdkCopyToClipboard],
  styleUrls: ['./article-share-icons.component.scss'],
  template: `
    <div *transloco="let t" class="flex items-center gap-4">
      <span class="text-lg font-bold">
        {{ t('articleShareIcons.title') }}
      </span>

      @for (item of items(); track $index) {
        <a
          role="button"
          [attr.aria-label]="t(item.ariaLabel)"
          [href]="item.href"
          target="_blank"
        >
          <fast-svg class="text-al-foreground" [name]="item.icon" size="28" />
        </a>
      }
      <a
        role="button"
        [attr.aria-label]="t('articleShareIcons.urlAriaLabel')"
        [class.url-icon-animated]="animating()"
        [cdkCopyToClipboard]="articleUrl()"
        (click)="animating.set(true)"
        (animationend)="animating.set(false)"
        target="_blank"
      >
        <fast-svg
          name="link"
          class="text-al-foreground"
          [class.!hidden]="animating()"
          size="28"
        />
        <fast-svg
          name="circle-check"
          class="text-al-foreground"
          [class.!hidden]="!animating()"
          size="28"
        />
      </a>
    </div>
  `,
})
export class ArticleShareIconsComponent {
  readonly slug = input.required<string>();
  readonly title = input.required<string>();
  readonly language = input.required<string>();

  readonly animating = signal(false);

  readonly articleUrl = computed(() =>
    this.language() === 'pl_PL'
      ? `https://angular.love/pl/${this.slug()}`
      : `https://angular.love/${this.slug()}`,
  );

  readonly items = computed<ShareItem[]>(() => {
    const url = this.articleUrl();
    const text = encodeURIComponent(this.title());

    return [
      {
        icon: 'twitter-x',
        href: `https://x.com/intent/tweet?text=${text}&url=${url}&hashtags=angularlove`,
        ariaLabel: 'articleShareIcons.twitterAriaLabel',
      },
      {
        icon: 'linkedIn',
        href: `https://www.linkedin.com/shareArticle?mini=true&url=${url}`,
        ariaLabel: 'articleShareIcons.linkedInAriaLabel',
      },
      {
        icon: 'facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        ariaLabel: 'articleShareIcons.facebookAriaLabel',
      },
    ];
  });
}
