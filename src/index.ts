import { readFileSync } from 'fs';
import { join } from 'path';
import Crawler from 'crawler';
import controller from './controller';

const config = JSON.parse(readFileSync(join(__dirname, '/../../config.json'), { encoding: 'utf-8' }));
const { urls } = config;

if (!urls) {
  console.error('Expected a parameter with an URL to crawl!');
  process.exit(1);
}

const crawler = new Crawler({
  callback: controller,
});

crawler.queue(urls);
