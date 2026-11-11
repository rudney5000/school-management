import path from 'node:path';
import { Font } from '@react-pdf/renderer';

/**
 * The Noto Sans and Noto Serif faces shipped in packages/documents/fonts.
 * Noto covers French, English and Lingala accents. The path works from src/engine (tests)
 * and from dist/engine (built package) alike.
 */
const FONTS_DIR = path.join(__dirname, '..', '..', 'fonts');

let registered = false;

const face = (family: string, style: string) => path.join(FONTS_DIR, `${family}-${style}.ttf`);

export function registerFonts(): void {
  if (registered) return;
  for (const family of ['NotoSans', 'NotoSerif']) {
    Font.register({
      family,
      fonts: [
        { src: face(family, 'Regular'), fontWeight: 'normal', fontStyle: 'normal' },
        { src: face(family, 'Bold'), fontWeight: 'bold', fontStyle: 'normal' },
        { src: face(family, 'Italic'), fontWeight: 'normal', fontStyle: 'italic' },
        { src: face(family, 'BoldItalic'), fontWeight: 'bold', fontStyle: 'italic' },
      ],
    });
  }
  // French text must not be cut in the middle of a word.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
