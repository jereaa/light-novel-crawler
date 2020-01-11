import EpubImage from '../image';

export default class ImageManager {
  private images: EpubImage[] = [];

  add(image: string | EpubImage): EpubImage {
    let epubImage: EpubImage;
    if (image instanceof EpubImage) {
      epubImage = image;
    } else {
      epubImage = new EpubImage(`img${this.images.length.toString().padStart(3, '0')}`, image);
    }
    this.images.push(epubImage);
    return epubImage;
  }

  downloadAll(): void {
    this.images.forEach(image => image.download());
  }
}
