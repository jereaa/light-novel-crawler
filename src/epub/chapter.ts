import fs from 'fs';
import { join } from 'path';
import config from 'config';
import { IChapterInfo, ITLNote } from './models';

const outputDir: string = config.get('outputDir');
const chaptersDir: string = join(outputDir, 'Text');

export default (props: IChapterInfo, title: string, done: () => void): void => {
  if (!fs.existsSync(chaptersDir)) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    fs.mkdirSync(chaptersDir);
  }

  const chapterId = props.specialChapter
    ? props.specialChapter
    : `chapter${props.number?.toString().padStart(3, '0')}`;
  const filePath = join(chaptersDir, chapterId.concat('.xhtml'));
  const streamWriter = fs.createWriteStream(filePath);

  streamWriter.write('<?xml version="1.0" encoding="utf-8"?>\n');
  streamWriter.write('<!DOCTYPE html>\n');
  streamWriter.write('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">\n');
  streamWriter.write('<head>\n');
  streamWriter.write(`<title>${title}</title>\n`);
  streamWriter.write('<link href="../Styles/stylesheet.css" rel="stylesheet" type="text/css"/>\n');
  streamWriter.write('<meta content="text/html; charset=utf-8" http-equiv="default-style"/>\n');
  streamWriter.write('</head>\n');

  streamWriter.write('<body>\n');
  streamWriter.write(`<section epub:type="bodymatter chapter" class="chapter" id="${chapterId}">\n`);

  let chapterName: string | undefined;
  if (props.specialChapter) {
    chapterName = props.specialChapter.replace(/^\w/, c => c.toUpperCase());
  } else if (props.number) {
    chapterName = `Chapter ${props.number}`;
  }

  if (chapterName) {
    streamWriter.write(`<h1 class="chapter__title">${chapterName}</h1>\n`);
  }

  if (props.content) {
    streamWriter.write(props.content);
  } else if (props.parts) {
    props.parts.forEach((part, partIndex) => {
      const partId = `part${(partIndex + 1).toString().padStart(3, '0')}`;
      streamWriter.write('<div class="chapter-part">\n');
      streamWriter.write(`<h2 class="chapter-part__title" id="${chapterId}${partId}">Part ${partIndex + 1}</h2>\n`);
      streamWriter.write(part);
      streamWriter.write('</div>\n');
    });
  }
  streamWriter.write('</section>\n');
  streamWriter.write('</body>\n');
  streamWriter.end('</html>\n', done);
};

export function writeTlNotes(notes: ITLNote[], title: string, done: () => void): void {
  if (!fs.existsSync(chaptersDir)) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    fs.mkdirSync(chaptersDir);
  }

  const chapterId = 'tl-notes';
  const filePath = join(chaptersDir, chapterId.concat('.xhtml'));
  const streamWriter = fs.createWriteStream(filePath);

  streamWriter.write('<?xml version="1.0" encoding="utf-8"?>\n');
  streamWriter.write('<!DOCTYPE html>\n');
  streamWriter.write('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">\n');
  streamWriter.write('<head>\n');
  streamWriter.write(`<title>${title}</title>\n`);
  streamWriter.write('<link href="../Styles/stylesheet.css" rel="stylesheet" type="text/css"/>\n');
  streamWriter.write('<meta content="text/html; charset=utf-8" http-equiv="default-style"/>\n');
  streamWriter.write('</head>\n');

  streamWriter.write('<body>\n');
  streamWriter.write(`<section epub:type="bodymatter chapter" class="chapter" id="${chapterId}">\n`);

  streamWriter.write('<h1 class="chapter__title">Translator\'s Notes</h1>\n');
  streamWriter.write('<div class="tl-notes__list">\n');

  notes.forEach((note, noteIndex) => {
    streamWriter.write(`<p>[<a href="${note.href}">${(noteIndex + 1).toString().padStart(2, '0')}</a>] ${note.text}</p>\n`);
  });
  streamWriter.write('</div>\n');

  streamWriter.write('</section>\n');
  streamWriter.write('</body>\n');
  streamWriter.end('</html>\n', done);
}
