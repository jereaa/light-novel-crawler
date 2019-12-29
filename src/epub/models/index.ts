export interface IChapterConfig {
  title?: string;
  specialChapter?: 'prologue' | 'epilogue' | 'afterword';
  number?: number;
  parts?: string[];
  url?: string;
}

export interface IEpubConfig {
  title: string;
  author: string;
  chapters: IChapterConfig[];
}

export interface IChapterInfo {
  number?: number;
  title?: string;
  specialChapter?: 'prologue' | 'epilogue' | 'afterword';
  parts?: string[];
  content?: string;
}
