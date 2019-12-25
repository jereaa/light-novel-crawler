import Crawler from 'crawler';
import controller from './controller';

const url = process.argv[2];

if (!url) {
  console.error('Expected a parameter with an URL to crawl!');
  process.exit(1);
}

const crawler = new Crawler({
  callback: controller,
});

crawler.queue(url);
