export interface IChapterConfig {
  headers: string[];
  urls: string[];
  id?: string;
  title?: string;
  titleIsHeader?: boolean;
}

export interface IEpubConfig {
  title: string;
  author: string;
  chapters: IChapterConfig[];
}

export interface ITLNote {
  id?: string;
  href?: string;
  readonly text: string;
  readonly chapter: IChapterOptions;
}

export interface IEpubTextOptions {
  readonly id?: string;
  readonly title?: string;
  readonly includeStyles?: boolean;
}

export interface ITLNotesOptions extends IEpubTextOptions {
  readonly tlNotes?: ITLNote[];
}

export interface IChapterOptions extends IEpubTextOptions {
  readonly headers: string[];
  parts: string[];
}
