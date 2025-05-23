import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { Anchor } from '@angular-love/contracts/articles';

@Component({
  selector: 'al-table-of-contents',
  imports: [NgClass, RouterLink, TranslocoDirective],
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableOfContentsComponent {
  readonly anchors = input.required<Anchor[]>();

  readonly activeAnchorTitle = model<string | undefined>(undefined);

  protected readonly anchorClick = output<Anchor>();
}
