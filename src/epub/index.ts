import Crawler from 'crawler';
import config from 'config';
import { createWriteStream } from 'fs';
import { join } from 'path';

import EpubChapter from './text/chapter';
import TLNotes from './text/tl-notes';
import {
  IEpubConfig,
  IChapterConfig,
  IChapterOptions,
  ITLNote,
} from './models';

const outputDir: string = config.get('outputDir');
const imagesDir: string = join(outputDir, 'Images');

export default class EpubWriter {
  title: string;
  author: string;
  private chapterConfigs: IChapterConfig[];
  private chapters: EpubChapter[];
  private currentChapterIndex = 0;
  private tlNotes = new TLNotes();
  private imagesUrls: string[] = [];

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
          this.downloadImages();
          this.tlNotes.write();
        }
      });
    });
  }

  private downloadImages(): void {
    this.imagesUrls.forEach((url, index) => {
      this.crawler.queue({
        uri: url,
        encoding: null,
        jQuery: false,
        callback: (error, res, done) => {
          if (error) {
            console.error(`Error downloading image from ${url}. Error: ${error.message}`);
            return;
          }

          createWriteStream(join(imagesDir, `img${index.toString().padStart(3, '0')}.jpg`)).write(res.body, done);
        },
      });
    });
  }

  write(): void {
    const chapterConfig = this.chapterConfigs[this.currentChapterIndex];
    const chapterInfo: IChapterOptions = {
      headers: chapterConfig.headers.slice(0),
      parts: Array<string>(chapterConfig.urls.length),
      ...chapterConfig.id && { id: chapterConfig.id },
      ...chapterConfig.title && { title: chapterConfig.title },
    };
    this.chapters[this.currentChapterIndex] = new EpubChapter(chapterInfo);

    chapterConfig.urls.forEach((url, urlIndex) => {
      this.crawler.queue({
        uri: url,
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

          let paragraphs = $('.entry-content > p');
          paragraphs = paragraphs.map((index, element) => {
            // We are interested in all <p> tags except the first 2 and the last one
            if (index >= 2 && index < paragraphs.length - 1) {
              if (index >= 3) {
                $(element).addClass('margin-top');
              }

              return element;
            }

            return null;
          });

          const { imagesUrls } = this;
          const images = paragraphs.find('img');
          images.each((index, imageElement) => {
            imagesUrls.push(imageElement.attribs['data-orig-file']);
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
          text = text.replace(/<br>/g, '</p>\n<p>');
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
