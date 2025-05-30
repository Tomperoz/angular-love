import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';
import { debounceTime, filter, startWith, tap } from 'rxjs';

import {
  AlLocalizePipe,
  AlLocalizeService,
} from '@angular-love/blog/i18n/util';
import {
  GlobalSearchStore,
  provideSearch,
} from '@angular-love/blog/search/data-access';
import { SearchResultItemComponent } from '@angular-love/search-result-item';

import { GlobalSearchService } from '../global-search.service';

@Component({
  selector: 'al-search-dialog',
  imports: [
    ReactiveFormsModule,
    SearchResultItemComponent,
    RouterLink,
    TranslocoDirective,
    NgClass,
    FastSvgComponent,
    AlLocalizePipe,
  ],
  templateUrl: './search-dialog.component.html',
  styleUrl: './search-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideSearch(), GlobalSearchStore],
})
export class SearchDialogComponent implements OnInit, OnDestroy {
  readonly searchStore = inject(GlobalSearchStore);
  readonly searchForm = new FormControl('', {
    validators: [Validators.maxLength(50)],
  });

  protected readonly adBannerStoreVisible = signal(false);

  private readonly _searchService = inject(GlobalSearchService);
  private readonly _searchInput =
    viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _localizeService = inject(AlLocalizeService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  @HostListener('click', ['$event.target']) onClick(target: HTMLElement): void {
    if (target.classList.contains('al-overlay')) {
      this.closeSearch();
    }
  }

  @HostListener('keydown.enter', ['$event']) onEnterKeyDown(
    e: KeyboardEvent,
  ): void {
    e.preventDefault();
    this.goToAllResults();
  }

  @HostListener('keydown.escape', ['$event']) onEscapeKeyDown(
    e: KeyboardEvent,
  ): void {
    e.preventDefault();
    this.closeSearch();
  }

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private _translocoService: TranslocoService,
  ) {
    effect(() => {
      if (this.searchStore.total()) {
        this._liveAnnouncer.announce(
          this._translocoService.translate('search.results', {
            total: this.searchStore.total(),
          }),
        );
      } else {
        this._liveAnnouncer.announce(
          this._translocoService.translate('no-matches'),
        );
      }
    });
  }

  ngOnInit(): void {
    this.listenToRouteChanges();

    this._searchInput().nativeElement.focus();
    document.body.style.overflow = 'hidden';

    const value$ = this.searchForm.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
    );
    this.searchStore.updateQuery(value$);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  protected goToAllResults(): void {
    const totalResults = this.searchStore.total();
    if (totalResults && totalResults > 0) {
      this._router.navigate(this._localizeService.localizePath(['search']), {
        queryParams: {
          q: this.searchForm.value,
        },
        relativeTo: this._activatedRoute,
      });
      this.closeSearch();
    }
  }

  private closeSearch(): void {
    this._searchService.hideSearchDialog();
  }

  private listenToRouteChanges(): void {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        tap(() => this.closeSearch()),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
