
import moment from 'moment';
import { PROP_POST } from '../constants/index.js';

export const convertDateToTimestamp = (dateStr: any) => {
  const [time, date] = dateStr.split(" ");

  const [hours, minutes] = time.split(":");
  const [day, month, year] = date.split("/");

  const dateObj = new Date(year, month - 1, day, hours, minutes);

  // Lấy timestamp 10 chữ số (giây) và nhân với 10 để tạo thành 11 chữ số
  const timestampInSeconds = Math.floor(dateObj.getTime() / 1000);

  return timestampInSeconds;
};


const extractSource = (url: string) => {
  return new URL(url).hostname;
};

export const convertContentToPost = (article: any, articleContent: any) => {
  const articleAfterValidate = validateBeforeConvert(article, articleContent);

  const author = extractSource(article.url);
  const image = articleContent.image ? [articleContent.image] : []
  

  const post = {
    doc_type: PROP_POST.DOC_TYPE,
    source_type: PROP_POST.SOURCE_TYPE,
    crawl_source: PROP_POST.CRAWL_SOURCE,
    crawl_source_code: PROP_POST.CRAWL_SOURCE_CODE,
    pub_time: convertDateToTimestamp(articleAfterValidate.time_publication),
    crawl_time: convertDateToTimestamp(articleAfterValidate.crawlTime),
    title: articleAfterValidate.title,
    content: articleAfterValidate.content,
    url: articleAfterValidate.url,
    // media_urls: PROP_POST.MEDIA_URL,
    media_urls: JSON.stringify(image),
    comments: PROP_POST.COMMENT,
    shares: PROP_POST.SHARE,
    reactions: PROP_POST.REACTION,
    favors: PROP_POST.FAVOR,
    views: PROP_POST.VIEW,
    web_tags: PROP_POST.WEB_TAGS,
    web_keywords: '[' + articleAfterValidate.keyword + ']',
    auth_id: author,
    auth_name: author,
    auth_type: PROP_POST.AUTH_TYPE,
    auth_url: articleAfterValidate.url,
    source_id: author,
    source_name: author,
    source_url: articleAfterValidate.url,
    sentiment: PROP_POST.SENTIMENT,
    server: 'server_test'
  };
  return post;
};

// export const validateBeforeConvert = (article:any, articleContent:any) => {
//   return {
//     articleId: article?._id.toString() ?? 'null',
//     title: articleContent.title ?? 'null',
//     subtitle: articleContent.subtitle ?? 'null',
//     content: articleContent.content,
//     time_publication: articleContent.time_publication ?? 'null',
//     url: article.url.endsWith('/') ? article.url.slice(0, -1) : article.url,
//     author: article?.author ?? 'null',
//     keyword: article?.keyword ?? 'null',
//     crawlTime: moment().format('HH:mm DD/MM/YYYY').toString()
//   };
// };

export const validateBeforeConvert = (article: any, articleContent: any) => {
  return {
    articleId: article?._id ? article._id.toString() : 'null',
    title: articleContent?.title ?? 'null',
    subtitle: articleContent?.subtitle ?? 'null',
    content: articleContent?.content ?? 'null',
    time_publication: articleContent?.time_publication ?? 'null',
    url: article?.url ? (article.url.endsWith('/') ? article.url.slice(0, -1) : article.url) : 'null',
    author: article?.author ?? 'null',
    keyword: article?.keyword ?? 'null',
    crawlTime: moment().format('HH:mm DD/MM/YYYY') // hoặc timezone VN nếu cần
  };
};