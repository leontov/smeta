import type { SQLTransaction } from 'expo-sqlite';
import { Asset } from 'expo-asset';

import { executeAsync, getDatabase } from '@/core/storage/database';

const SEED_ASSET = require('../../assets/seeds/normative-index.json');

interface NormativeSeedItem {
  code: string;
  title: string;
  collection: string;
  workType?: string;
}

interface NormativeSeedPayload {
  version: string;
  items: NormativeSeedItem[];
}

let seeded = false;

export const loadNormativeMetadata = async (): Promise<void> => {
  if (seeded) {
    return;
  }

  const db = getDatabase();
  const asset = await Asset.fromModule(SEED_ASSET).downloadAsync();
  if (!asset.localUri) {
    return;
  }

  const response = await fetch(asset.localUri);
  const payload = (await response.json()) as NormativeSeedPayload;

  await executeAsync(db, 'DELETE FROM normative_index');

  await new Promise<void>((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      payload.items.forEach((item) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO normative_index (code, title, collection, work_type) VALUES (?, ?, ?, ?)`
            .trim(),
          [item.code, item.title, item.collection, item.workType ?? null]
        );
      });
    }, reject, resolve);
  });

  seeded = true;
};
