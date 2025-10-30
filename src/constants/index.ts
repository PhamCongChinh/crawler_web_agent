export const LINE_STRING = '---------------------------------------------------------------------------';

export const ROOT_URL = 'http://103.97.125.64:4416/api/v1/posts/insert-unclassified-org-posts'
// export const ROOT_URL = 'http://123.24.128.46:4420/api/v1/posts/insert-unclassified-org-posts'

export const NUMBER_ARTICLE_PER_CHUNK = 20;

export const PROP_POST = {
  DOC_TYPE: 1,
  SOURCE_TYPE: 8,
  CRAWL_SOURCE: 4,
  CRAWL_SOURCE_CODE: 'web',
  MEDIA_URL: '[]',
  COMMENT: 0,
  SHARE: 0,
  REACTION: 0,
  FAVOR: 0,
  VIEW: 0,
  WEB_TAGS: '[]',
  CRAWL_SOURCE_NAME: 'WEBSITE',
  AUTH_TYPE: 1,
  ORG_ID: 10,
  SENTIMENT: 0
};

export const STATUS = {
  SUCCESS: 'Thành công',
  ERROR: 'Thất bại'
};

export const REGEX_URL_SOURCE = '^(?:https?:\/\/)?([^\/]+)';

export const modelAI = {
  gemini_15_flash_latest: 'gemini-1.5-flash-latest',
  gemini_20_flash_experimental: 'gemini-2.0-flash-exp'
};