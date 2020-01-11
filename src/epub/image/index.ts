import Crawler from 'crawler';
import config from 'config';
import fs from 'fs';
import { join, extname } from 'path';

const outputDir: string = config.get('outputDir');
const imagesDir: string = join(outputDir, 'Images');

export default class EpubImage {
  private static crawler = new Crawler({});
  readonly id: string;
  readonly originalUrl: string;

  constructor(id: string, originalUrl: string) {
    this.id = id;
    this.originalUrl = originalUrl;
  }

  toHtml(): string {
    return '<svg xmlns="http://www.w3.org/2000/svg">'.concat(
      `<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="../Images/${this.id}.${extname(this.originalUrl)}">`,
      '</image></svg>',
    );
  }

  download(): void {
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }

    EpubImage.crawler.queue({
      uri: this.originalUrl,
      encoding: null,
      jQuery: false,
      callback: (error, res, done) => {
        if (error) {
          console.error(`Error downloading image from ${this.originalUrl}. Error: ${error.message}`);
          return;
        }

        fs.createWriteStream(join(imagesDir, `${this.id}.${extname(this.originalUrl)}`)).write(res.body, done);
      },
    });
  }
}
