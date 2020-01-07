import fs from 'fs';
import { join } from 'path';
import config from 'config';

import { IEpubTextOptions } from '../models';

const outputDir: string = config.get('outputDir');
const chaptersDir: string = join(outputDir, 'Text');

export const DEFAULT_ID = 'default-id';

export default abstract class EpubText {
  id = DEFAULT_ID;
  includeStyles = true;
  content = '';
  title: string | undefined;

  constructor(options?: IEpubTextOptions) {
    if (options) {
      this.title = options.title;

      if (options.includeStyles) {
        this.includeStyles = options.includeStyles;
      }

      if (options.id) {
        this.id = options.id;
      }
    }
  }

  abstract setId(): void;
  abstract setContent(content?: string): void;

  write(done?: () => void): void {
    if (!fs.existsSync(chaptersDir)) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      fs.mkdirSync(chaptersDir);
    }

    const filePath = join(chaptersDir, this.id.concat('.xhtml'));
    const streamWriter = fs.createWriteStream(filePath);

    streamWriter.write('<?xml version="1.0" encoding="utf-8"?>\n');
    streamWriter.write('<!DOCTYPE html>\n');
    streamWriter.write('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">\n');
    streamWriter.write('<head>\n');

    if (this.title) {
      streamWriter.write(`<title>${this.title}</title>\n`);
    }

    if (this.includeStyles) {
      streamWriter.write('<link href="../Styles/stylesheet.css" rel="stylesheet" type="text/css"/>\n');
    }

    streamWriter.write('<meta content="text/html; charset=utf-8" http-equiv="default-style"/>\n');
    streamWriter.write('</head>\n');

    streamWriter.write('<body>\n');
    streamWriter.write(`<section epub:type="bodymatter chapter" class="chapter" id="${this.id}">\n`);

    streamWriter.write(this.content);

    streamWriter.write('</section>\n');
    streamWriter.write('</body>\n');
    streamWriter.end('</html>\n', done);
  }
}
