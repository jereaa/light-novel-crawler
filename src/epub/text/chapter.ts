import EpubText, { DEFAULT_ID } from './base';
import { IChapterOptions } from '../models';

export default class EpubChapter extends EpubText {
  headers: string[] = ['Default chapter'];
  parts: string[];
  number: number | undefined;

  constructor(options: IChapterOptions) {
    super(options);
    this.headers = options.headers;
    this.parts = options.parts;

    this.setId();
  }

  setId(id?: string): void {
    if (id) {
      this.id = id;
    } else if (this.id === DEFAULT_ID || !this.id) {
      let newId = this.headers[0].toLowerCase().replace(' ', '');
      const match = /(\d*)$/.exec(newId);

      if (match) {
        newId = newId.replace(/\d*$/, match[1].padStart(3, '0'));
      }
      this.id = newId;
    }
  }

  setContent(): void {
    this.content = '';

    this.headers.forEach((heading, index) => {
      const headerNum = index + 1;
      const headerClass = ['chapter__title', 'chapter__subtitle'][index] || `chapter__header${headerNum}`;
      this.content += `<h${headerNum} class="${headerClass}">${heading}</h${headerNum}>\n`;
    });

    const partsHeaderNum = this.headers.length + 1;
    this.parts.forEach((part, index) => {
      if (this.parts.length > 1) {
        const partId = `part${(index + 1).toString().padStart(3, '0')}`;
        this.content += '<div class="chapter-part">\n';
        this.content += `<h${partsHeaderNum} class="chapter-part__title" id="${this.id}-${partId}">Part ${index + 1}</h${partsHeaderNum}>\n\n`;
      }

      this.content += part;

      if (this.parts.length > 1) {
        this.content += '</div>\n';
      }
    });
  }

  write(done?: () => void): void {
    this.setContent();
    super.write(done);
  }
}
