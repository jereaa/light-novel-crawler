import Crawler from 'crawler';

import EpubChapter from './text/chapter';
import TLNotes from './text/tl-notes';
import {
  IEpubConfig,
  IChapterConfig,
  IChapterOptions,
  ITLNote,
} from './models';
import ImageManager from './services/image-manager';

export default class EpubWriter {
  title: string;
  author: string;
  private chapterConfigs: IChapterConfig[];
  private chapters: EpubChapter[];
  private currentChapterIndex = 0;
  private tlNotes = new TLNotes();
  private imageManager = new ImageManager();

  private crawler = new Crawler({});

  constructor(props: IEpubConfig) {
    this.title = props.title;
    this.author = props.author;
    this.chapterConfigs = JSON.parse(JSON.stringify(props.chapters));
    this.chapters = Array(this.chapterConfigs.length);

    this.setup();
  }

  private setup(): void {
    this.crawler.on('drain', () => {
      this.chapters[this.currentChapterIndex].write(() => {
        this.currentChapterIndex += 1;
        if (this.currentChapterIndex < this.chapterConfigs.length) {
          this.write();
        } else {
          this.imageManager.downloadAll();
          this.tlNotes.write();
        }
      });
    });
  }

  write(): void {
    const chapterConfig = this.chapterConfigs[this.currentChapterIndex];
    const chapterInfo: IChapterOptions = {
      headers: chapterConfig.headers.slice(0),
      parts: Array<string>(chapterConfig.urls.length),
      title: this.title,
      ...chapterConfig.id && { id: chapterConfig.id },
      ...chapterConfig.title && { title: chapterConfig.title },
    };
    this.chapters[this.currentChapterIndex] = new EpubChapter(chapterInfo);

    chapterConfig.urls.forEach((url, urlIndex) => {
      this.crawler.queue({
        uri: url,
        jQuery: {
          name: 'cheerio',
          options: {
            xmlMode: true,
          },
        },
        callback: (error, res, done) => {
          if (error) {
            console.error(`Error fetching URL index ${urlIndex} of chapter ${this.currentChapterIndex}. Error: ${error.message}.`);
            return;
          }

          const { $ } = res;
          if (!$) {
            console.error('Coudln\'t get selector to select from the retrieved HTML');
            return;
          }

          const { imageManager } = this;
          let paragraphs = $('.entry-content > p');
          paragraphs = paragraphs.map((index, element) => {
            // We are interested in all <p> tags except the first 2 and the last one
            if (index >= 2 && index < paragraphs.length - 1) {
              // If paragraph contains an image, we use our own format
              const img = $(element).find('img');
              if (img.length > 0) {
                const epubImage = imageManager.add(img[0].attribs['data-orig-file']);
                return $(`<div class="page-image">${epubImage.toHtml()}</div>`);
              }

              // We are not intereste in translator notes. Those go elsewhere.
              const tlNotes = $(element).find('a[href^="#_ftnref"]');
              if (tlNotes.length > 0) {
                return null;
              }

              if (index >= 3) {
                $(element).addClass('margin-top');
              }

              return element;
            }

            return null;
          });

          let text = '';
          paragraphs.each((index, element) => {
            text += `${$.html(element)}\n`;
          });

          if (!text) {
            console.error('Couldn\'t retrieve any HTML from selection.');
            return;
          }

          // Remove indent and replace <br> tag por <p>
          text = text.replace(/&#x3000;/g, '');
          text = text.replace(/<br\/>/g, '</p>\n<p>');
          text = '<div class="chapter-part__content">\n'
            + `${text}\n`
            + '</div>\n';

          // Search for TL Notes
          const chapterTlNotes = $('a[name^="_ftnref"]');
          if (chapterTlNotes.length > 0) {
            chapterTlNotes.each((index, element) => {
              const noteNameInHTML = $(element).attr('href')?.substr(1);
              const noteText = $(`a[name="${noteNameInHTML}"]`).next().text();
              const note: ITLNote = {
                text: noteText,
                chapter: chapterInfo,
              };
              const noteId = this.tlNotes.add(note);

              if (text) {
                text = text.replace(`href="${$(element).attr('href')}"`, `href="./tl-notes.xhtml#${noteId}"`);
                text = text.replace(`name="${$(element).attr('name')}"`, `id="ref-${noteId}"`);
              }
            });
          }

          chapterInfo.parts[urlIndex] = text;
          done();
        },
      });
    });
  }
}
