import Crawler from 'crawler';

import writeChapter, { writeTlNotes } from './chapter';
import {
  IEpubConfig,
  IChapterConfig,
  IChapterInfo,
  ITLNote,
} from './models';

export default class EpubWriter {
  title: string;
  author: string;
  private chapterConfigs: IChapterConfig[];
  private chapters: IChapterInfo[];
  private currentChapterIndex = 0;
  private tlNotes: ITLNote[] = [];

  private crawler = new Crawler({});

  constructor(props: IEpubConfig) {
    this.title = props.title;
    this.author = props.author;
    this.chapterConfigs = JSON.parse(JSON.stringify(props.chapters));
    this.chapters = Array<IChapterInfo>(this.chapterConfigs.length);

    this.setup();
  }

  private setup(): void {
    this.crawler.on('drain', () => {
      writeChapter(this.chapters[this.currentChapterIndex], this.title, () => {
        this.currentChapterIndex += 1;
        if (this.currentChapterIndex < this.chapterConfigs.length) {
          this.write();
        } else {
          writeTlNotes(this.tlNotes, this.title, () => {});
        }
      });
    });
  }

  write(): void {
    const chapterConfig = this.chapterConfigs[this.currentChapterIndex];
    const chapterInfo: IChapterInfo = {
      ...chapterConfig.title && { title: chapterConfig.title },
      ...chapterConfig.specialChapter && { specialChapter: chapterConfig.specialChapter },
      ...chapterConfig.number && { number: chapterConfig.number },
      ...chapterConfig.parts && { parts: Array(chapterConfig.parts.length) },
    };
    this.chapters[this.currentChapterIndex] = chapterInfo;

    let fetchURLs: string[];
    if (chapterConfig.parts) {
      fetchURLs = chapterConfig.parts;
    } else if (chapterConfig.url) {
      fetchURLs = [chapterConfig.url];
    } else {
      console.error(`Expected chapter ${this.currentChapterIndex} to have either an URL or parts properties.`);
      return;
    }

    fetchURLs.forEach((url, urlIndex) => {
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
            const epubTlNotes = this.tlNotes;
            chapterTlNotes.each((index, element) => {
              const noteNameInHTML = $(element).attr('href')?.substr(1);
              const noteText = $(`a[name="${noteNameInHTML}"]`).next().text();
              const noteId = `tl-note_${(epubTlNotes.length + 1).toString().padStart(3, '0')}`;
              epubTlNotes.push({
                id: noteId,
                href: `./tl-notes.xhtml#${noteId}`,
                text: noteText,
                chapter: chapterInfo,
              });

              if (text) {
                text = text.replace(`href="${$(element).attr('href')}"`, `href="./tl-notes.xhtml#${noteId}"`);
                text = text.replace(`name="${$(element).attr('name')}"`, `name="tl-note_${(epubTlNotes.length).toString().padStart(3, '0')}"`);
              }
            });
          }

          if (chapterInfo.parts) {
            chapterInfo.parts[urlIndex] = text;
          } else {
            chapterInfo.content = text;
          }

          done();
        },
      });
    });
  }
}
