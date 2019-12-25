import { writeFileSync } from 'fs';
import { join } from 'path';
import { CrawlerCallback } from 'crawler';

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

  text = text.replace(/&#x3000;/g, '<p>');
  text = text.replace(/<br>/g, '</p>');

  writeFileSync(join(__dirname, '/../../', '/output.xhtml'), text);
  return done();
};

export default callback;
