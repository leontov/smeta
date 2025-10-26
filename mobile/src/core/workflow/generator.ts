import { getDatabase } from '@/core/storage/database';
import { CalculationMethod } from '@/types/project';

export interface NormativeMatchInput {
  projectName: string;
  description: string;
  area?: number;
  region?: string;
  indexProfile?: string;
  calculationMethod: CalculationMethod;
}

export interface NormativeCandidate {
  code: string;
  title: string;
  collection: string;
  confidence: number;
}

export const generateCandidates = async (input: NormativeMatchInput): Promise<NormativeCandidate[]> => {
  const db = getDatabase();
  const tokens = tokenize(input.description);

  if (tokens.length === 0) {
    return [];
  }

  return new Promise((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        `SELECT code, title, collection FROM normative_index WHERE ${tokens
          .map(() => 'title LIKE ? OR code LIKE ?')
          .join(' OR ')}`,
        tokens.flatMap((token) => [`%${token}%`, `%${token}%`]),
        (_, result) => {
          const rows = result.rows;
          const candidates: NormativeCandidate[] = [];
          for (let i = 0; i < rows.length; i += 1) {
            const row = rows.item(i);
            candidates.push({
              code: row.code,
              title: row.title,
              collection: row.collection,
              confidence: scoreCandidate(tokens, row.title)
            });
          }
          resolve(candidates.sort((a, b) => b.confidence - a.confidence));
          return true;
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const scoreCandidate = (tokens: string[], title: string) => {
  const normalized = title.toLowerCase();
  const matches = tokens.filter((token) => normalized.includes(token)).length;
  return tokens.length === 0 ? 0 : matches / tokens.length;
};
