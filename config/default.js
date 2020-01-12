const { join } = require('path');

module.exports = {
  rootDir: join(__dirname, '../'),
  outputDir: join(__dirname, '../out/'),
  epub: {
    title: 'Isekai Maō to Shōkan Shōjo no Dorei Majutsu - Volume 12',
    author: 'Yukiya Murasaki',
    chapters: [
      {
        id: 'prologue',
        headers: ['Prologue'],
        titleIsHeader: true,
        urls: [
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/vol12prologue-part-1/',
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/vol12prologue-part-2/',
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/vol12prologue-part-3/',
        ],
      },
      {
        id: 'chapter01',
        headers: ['Chapter 1', 'Trying Out Practicing'],
        titleIsHeader: true,
        urls: [
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/chapter-1-trying-out-practicing-part-1/',
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/chapter-1-trying-out-practicing-part-2/',
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/chapter-1-trying-out-practicing-part-3/',
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/chapter-1-trying-out-practicing-part-4/',
          'https://isekaicyborg.wordpress.com/isekai-maou-to-shoukan-shoujo-dorei-majutsu/chapter-1-trying-out-practicing-part-5/',
        ],
      },
    ],
  },
};
