import { Router } from 'express';
import { z } from 'zod';

import { loadDataset } from '../config/dataset.js';
import { BackendConfiguration } from '../setup/configuration.js';

const querySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export function createNormsRouter(config: BackendConfiguration) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const params = querySchema.parse(req.query);
      const dataset = await loadDataset(config.datasetVersion);
      const q = params.q.toLowerCase();
      const items = dataset.norms
        .filter(
          (norm) =>
            norm.code.toLowerCase().includes(q) ||
            norm.title.toLowerCase().includes(q) ||
            norm.section.toLowerCase().includes(q),
        )
        .slice(0, params.limit);
      res.json({
        total: items.length,
        items,
        meta: dataset.meta,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
