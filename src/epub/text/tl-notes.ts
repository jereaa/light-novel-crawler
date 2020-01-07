import baseText from './base';
import { ITLNotesOptions, ITLNote } from '../models';

export default class TlNotes extends baseText {
  private notes: ITLNote[] = [];

  constructor(options?: ITLNotesOptions) {
    super(options);

    if (options && options.tlNotes) {
      this.notes = options.tlNotes;
    }

    this.setId();
  }

  setId(): void {
    this.id = 'tl-notes';
  }

  setContent(): void {
    this.content = '';
    this.notes.forEach((note, noteIndex) => {
      this.content += `<p>[<a href="${note.href}">${(noteIndex + 1).toString().padStart(2, '0')}</a>] ${note.text}</p>\n`;
    });
  }

  add(note: ITLNote): string {
    const idNum = this.notes.push(note);
    const id = `tl-note_${(idNum).toString().padStart(3, '0')}`;
    const href = `./${this.notes[idNum - 1].chapter.id}.xhtml#ref-${id}`;

    this.notes[idNum - 1].id = id;
    this.notes[idNum - 1].href = href;

    return id;
  }

  write(done?: () => void): void {
    this.setContent();
    super.write(done);
  }
}
