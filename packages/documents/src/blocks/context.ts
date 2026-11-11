import { DocumentError } from '../errors';
import { assetIdOf, type Layout } from '../engine/layout';
import { interpolate } from '../engine/variables';

export interface AssetFile {
  data: Uint8Array;
  mime: string;
}

/** Everything a block needs to draw itself. */
export interface RenderContext {
  layout: Layout;
  colors: {
    text: string;
    primary: string;
    accent: string;
    muted: string;
    white: string;
    border: string;
    rowAlt: string;
  };
  /** Replaces the `{{variables}}` of a template text. */
  t: (text: string) => string;
  /** Raw payload value, for blocks that read structured data (grades table). */
  value: (path: string) => unknown;
  asset: (ref: string) => { data: Buffer; format: 'png' | 'jpg' };
  qrDataUrl: string;
  /** Previews show empty fields as yellow zones; issued documents never do. */
  draft: boolean;
}

export const MM = 72 / 25.4;
export const mm = (value: number) => value * MM;

const FORMATS: Record<string, 'png' | 'jpg'> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

export function createContext(input: {
  layout: Layout;
  variables: Record<string, unknown>;
  assets: ReadonlyMap<string, AssetFile>;
  qrDataUrl: string;
  draft?: boolean;
}): RenderContext {
  const { layout, variables, assets } = input;
  return {
    layout,
    colors: {
      text: '#1a1a1a',
      primary: layout.theme.primary,
      accent: layout.theme.accent,
      muted: '#6b7280',
      white: '#ffffff',
      border: '#e5e7eb',
      rowAlt: '#f8f9fb',
    },
    t: (text) => interpolate(text, variables),
    value: (path) =>
      path
        .split('.')
        .reduce<unknown>(
          (node, key) =>
            node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined,
          variables,
        ),
    asset: (ref) => {
      const file = assets.get(assetIdOf(ref));
      if (!file)
        throw new DocumentError('UNKNOWN_ASSET', `${ref} was not provided to the renderer`);
      const format = FORMATS[file.mime];
      if (!format)
        throw new DocumentError('UNKNOWN_ASSET', `${ref}: unsupported image type ${file.mime}`);
      return { data: Buffer.from(file.data), format };
    },
    qrDataUrl: input.qrDataUrl,
    draft: input.draft ?? false,
  };
}
