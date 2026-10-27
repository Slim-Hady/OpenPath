import { readFile } from 'node:fs/promises';
import mammoth from 'mammoth';

type UnpdfModule = {
  extractText: (
    data: Uint8Array,
    options?: { mergePages?: boolean },
  ) => Promise<{ totalPages: number; text: string }>;
};

// unpdf is ESM-only and the API compiles to CommonJS. A native dynamic import
// is the supported bridge; tsc would otherwise rewrite import() to require().
const importEsm = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<UnpdfModule>;

export async function parseCvText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const { extractText } = await importEsm('unpdf');
    const result = await extractText(new Uint8Array(buffer), { mergePages: true });
    return result.text;
  }
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseCvFile(path: string, mimeType: string): Promise<string> {
  const buffer = await readFile(path);
  return parseCvText(buffer, mimeType);
}
