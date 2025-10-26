import { Asset } from 'expo-asset';

import { getDatabase, executeAsync } from '@/core/storage/database';

const SEED_ASSET = require('../../assets/seeds/normative-index.json');

let seeded = false;

export const loadNormativeMetadata = async () => {
  if (seeded) {
    return;
  }

  const db = getDatabase();
  const asset = await Asset.fromModule(SEED_ASSET).downloadAsync();
  if (!asset.localUri) {
    return;
  }

  const response = await fetch(asset.localUri);
  const payload = await response.json();

  await executeAsync(db, 'DELETE FROM normative_index');

  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      payload.items.forEach((item: any) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO normative_index (code, title, collection, work_type) VALUES (?, ?, ?, ?)`
            .trim(),
          [item.code, item.title, item.collection, item.workType]
        );
      });
    }, reject, resolve);
  });

  seeded = true;
};
