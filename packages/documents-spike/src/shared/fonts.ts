import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The spike reuses two of the Noto Sans files already shipped in
 * packages/pdf-templates (read only), so every engine embeds the same fonts.
 */
const fontsDir = fileURLToPath(new URL('../../../pdf-templates/src/fonts/', import.meta.url));

export const fontFiles = {
  regular: { name: 'NotoSans-Regular.ttf', path: `${fontsDir}NotoSans-Regular.ttf` },
  bold: { name: 'NotoSans-Bold.ttf', path: `${fontsDir}NotoSans-Bold.ttf` },
} as const;

let cache: { regular: Buffer; bold: Buffer } | null = null;

export function loadFonts(): { regular: Buffer; bold: Buffer } {
  cache ??= {
    regular: readFileSync(fontFiles.regular.path),
    bold: readFileSync(fontFiles.bold.path),
  };
  return cache;
}
