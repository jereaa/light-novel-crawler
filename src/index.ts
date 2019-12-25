import config from 'config';
import Crawler from 'crawler';

import controller from './controller';

const urls: string[] = config.get('urls');

if (!urls) {
  console.error('Expected a parameter with an URL to crawl!');
  process.exit(1);
}

const crawler = new Crawler({
  callback: controller,
});

crawler.queue(urls);
