import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';

import { ArticleListStore } from '@angular-love/blog/articles/data-access';
import { UiArticleCardComponent } from '@angular-love/blog/articles/ui-article-card';
import { UiArticleListTitleComponent } from '@angular-love/blog/articles/ui-article-list-title';
import {
  CardComponent,
  GradientCardDirective,
} from '@angular-love/blog/shared/ui-card';
import { NewsletterComponent } from '@angular-love/newsletter';

@Component({
  selector: 'al-recommended-articles',
  standalone: true,
  templateUrl: './feature-recommended-articles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiArticleListTitleComponent,
    UiArticleCardComponent,
    NewsletterComponent,
    CardComponent,
    GradientCardDirective,
    NgClass,
  ],
  providers: [ArticleListStore],
})
export class FeatureRecommendedArticlesComponent {
  private readonly _articleListStore = inject(ArticleListStore);

  readonly isFetchArticleListLoading: Signal<boolean> =
    this._articleListStore.isFetchArticleListLoading;

  readonly isFetchArticleListError =
    this._articleListStore.isFetchArticleListError;

  readonly articles = this._articleListStore.articles;

  constructor() {
    this._articleListStore.fetchArticleList({
      //TODO: change to recommended when vff is finished
      category: 'guides',
      take: 3,
    });
  }
}
