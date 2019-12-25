import { CrawlerCallback } from 'crawler';

const callback: CrawlerCallback = (error, res, done) => {
  if (error) {
    return console.error(error);
  }

  const { $ } = res;

  if (!$) {
    return console.error("Coudln't get selector to select from the retrieved HTML");
  }

  console.log($('.entry-content').html());
  return done();
};

export default callback;
