import { Hono } from 'hono';

import { ArrayResponse } from '@angular-love/blog-contracts/shared';
import { ArticlePreview } from '@angular-love/contracts/articles';
import { getPagination, wpClientMw } from '@angular-love/util-wp';

import { WPPostDetailsDto, WPPostDto } from './dtos';
import { toArticle, toArticlePreviewList } from './mappers';

const app = new Hono();

const defaultQuery = {
  skip: '0',
  take: '10',
  lang: 'en',
};

app.get('/', wpClientMw, async (c) => {
  const queryParams = c.req.query();

  const { per_page, page } = getPagination(queryParams);

  const query: Record<string, string | number> = {
    lang: queryParams.lang || defaultQuery.lang,
    per_page,
    page,
  };

  queryParams.authorSlug && (query.author_slug = queryParams.authorSlug);
  queryParams.category && (query.category_slug = queryParams.category);
  queryParams.excludeRecent &&
    (query.exclude_recent = queryParams.excludeRecent);

  const result = await c.var.wpClient.get<WPPostDto[]>('posts', {
    ...query,
    _fields:
      'id,type,slug,title.rendered,author,excerpt.rendered,date,featured_image_url,author_details.name,author_details.avatar_url,author_details.slug,acf',
  });

  return c.json(<ArrayResponse<ArticlePreview>>{
    data: toArticlePreviewList(result.data),
    total: Number(result.headers.get('x-wp-total')),
  });
});

app.get('/:slug', wpClientMw, async (c) => {
  const slug = c.req.param('slug');

  const result = await c.var.wpClient.get<WPPostDetailsDto[]>('posts', {
    slug: slug,
    _fields:
      'id,type,slug,title.rendered,author,content.rendered,date,featured_image_url,author_details,acf',
  });

  return c.json(toArticle(result.data[0]));
});

export default app;
