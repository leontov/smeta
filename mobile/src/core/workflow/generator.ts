import type { SQLResultSet, SQLTransaction } from 'expo-sqlite';

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

  return new Promise<NormativeCandidate[]>((resolve, reject) => {
    db.readTransaction((tx: SQLTransaction) => {
      tx.executeSql(
        `SELECT code, title, collection FROM normative_index WHERE ${tokens
          .map(() => 'title LIKE ? OR code LIKE ?')
          .join(' OR ')}`,
        tokens.flatMap((token) => [`%${token}%`, `%${token}%`]),
        (_: SQLTransaction, result: SQLResultSet) => {
          const candidates: NormativeCandidate[] = [];
          for (let i = 0; i < result.rows.length; i += 1) {
            const row = result.rows.item(i);
            candidates.push({
              code: row.code,
              title: row.title,
              collection: row.collection,
              confidence: scoreCandidate(tokens, row.title)
            });
          }
          resolve(candidates.sort((a, b) => b.confidence - a.confidence));
        },
        (_: SQLTransaction, error: Error) => {
          reject(error);
          return false;
        }
      );
    }, (error: Error) => reject(error));
  });
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const scoreCandidate = (tokens: string[], title: string): number => {
  const normalized = title.toLowerCase();
  const matches = tokens.filter((token) => normalized.includes(token)).length;
  return tokens.length === 0 ? 0 : matches / tokens.length;
};
