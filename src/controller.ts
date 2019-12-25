import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { CrawlerCallback } from 'crawler';
import config from 'config';

const outputDir: string = config.get('outputDir');

const callback: CrawlerCallback = (error, res, done) => {
  if (error) {
    return console.error(error);
  }

  const { $ } = res;
  if (!$) {
    return console.error("Coudln't get selector to select from the retrieved HTML");
  }

  let text = $('.entry-content > p').eq(2).html();
  if (!text) {
    console.error('Couldn\'t retrieve any HTML from selection.');
    return process.exit(1);
  }

  const title = $('.entry-title').text();
  text = text.replace(/&#x3000;/g, '');
  text = text.replace(/<br>/g, '</p>\n<p>');
  text = `<div class="chapter-part">\n
    <h2>${$('.entry-content > p').eq(1).text()}</h2>\n
    <p>${text}</p>\n
    </div>`;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  writeFileSync(join(outputDir, `${title}.xhtml`), text);
  return done();
};

export default callback;
