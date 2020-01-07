import Crawler from 'crawler';

import EpubChapter from './text/chapter';
import TLNotes from './text/tl-notes';
import {
  IEpubConfig,
  IChapterConfig,
  IChapterOptions,
  ITLNote,
} from './models';

export default class EpubWriter {
  title: string;
  author: string;
  private chapterConfigs: IChapterConfig[];
  private chapters: EpubChapter[];
  private currentChapterIndex = 0;
  private tlNotes = new TLNotes();

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

          let text = $('.entry-content > p').eq(2).html();
          if (!text) {
            console.error('Couldn\'t retrieve any HTML from selection.');
            return;
          }

          // Remove indent and replace <br> tag por <p>
          text = text.replace(/&#x3000;/g, '');
          text = text.replace(/<br>/g, '</p>\n<p>');
          text = '<div class="chapter-part__content">\n'
            + `<p>${text}</p>\n`
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
