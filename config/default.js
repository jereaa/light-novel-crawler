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
    ],
  },
};
