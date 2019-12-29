import Crawler from 'crawler';

import { IEpubConfig, IChapterConfig, IChapterInfo } from './models';
import writeChapter from './chapter';

export default class EpubWriter {
  title: string;
  author: string;
  private chapterConfigs: IChapterConfig[];
  private chapters: IChapterInfo[];
  private currentChapterIndex = 0;

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

          text = text.replace(/&#x3000;/g, '');
          text = text.replace(/<br>/g, '</p>\n<p>');
          text = '<div class="chapter-part__content">\n'
            + `<p>${text}</p>\n`
            + '</div>\n';

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
