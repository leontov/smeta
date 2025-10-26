import { useEffect, useState } from 'react';

import { ensureDatabase } from '@/core/storage/database';
import { loadNormativeMetadata } from '@/services/normativeLoader';

export const useBootstrap = () => {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureDatabase();
        await loadNormativeMetadata();
      } catch (error) {
        console.error('Bootstrap failed', error);
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady };
};
