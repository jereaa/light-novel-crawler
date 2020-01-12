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

  get filename(): string {
    return this.id + extname(this.originalUrl);
  }

  toHtml(): string {
    return `<img src="../Images/${this.filename}" />`;
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

        fs.createWriteStream(join(imagesDir, `${this.filename}`)).write(res.body, done);
      },
    });
  }
}
