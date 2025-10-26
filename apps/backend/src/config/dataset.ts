import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type NormativeDataset = {
  meta: DatasetMeta;
  norms: NormRecord[];
  indices: IndexRecord[];
};

export type DatasetMeta = {
  id: string;
  publishedAt: string;
  description: string;
};

export type NormRecord = {
  code: string;
  title: string;
  unit: string;
  section: string;
  explanation: string;
};

export type IndexRecord = {
  region: string;
  effectiveDate: string;
  labor: number;
  materials: number;
  machines: number;
};

export async function loadDataset(version: string): Promise<NormativeDataset> {
  const root = fileURLToPath(new URL('../../../../', import.meta.url));
  const base = join(root, 'datasets', version);
  const [metaRaw, normsRaw, indicesRaw] = await Promise.all([
    readFile(join(base, 'meta.json'), 'utf-8'),
    readFile(join(base, 'norms.jsonl'), 'utf-8'),
    readFile(join(base, 'indices.json'), 'utf-8'),
  ]);

  const meta = JSON.parse(metaRaw) as DatasetMeta;
  const norms = normsRaw
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as NormRecord);
  const indices = JSON.parse(indicesRaw) as IndexRecord[];

  return { meta, norms, indices };
}
