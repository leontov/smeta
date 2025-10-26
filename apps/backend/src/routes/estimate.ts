import { Router } from 'express';
import { z } from 'zod';

import { loadDataset } from '../config/dataset.js';
import { BackendConfiguration } from '../setup/configuration.js';

const requestSchema = z.object({
  description: z.string().min(5),
  method: z.enum(['resource', 'baseIndex']).default('resource'),
  region: z.string().default('Москва'),
  indexProfile: z.string().default('Базовый'),
});

export function createEstimateRouter(config: BackendConfiguration) {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const payload = requestSchema.parse(req.body);
      const dataset = await loadDataset(config.datasetVersion);
      const text = payload.description.toLowerCase();
      const suggested = dataset.norms
        .map((norm) => ({
          norm,
          score: scoreMatch(norm.title.toLowerCase(), text),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => ({
          code: item.norm.code,
          title: item.norm.title,
          unit: item.norm.unit,
          score: item.score,
          explanation: item.norm.explanation,
        }));

      res.json({
        method: payload.method,
        region: payload.region,
        indexProfile: payload.indexProfile,
        candidates: suggested,
        dataset: dataset.meta,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function scoreMatch(normTitle: string, description: string): number {
  const tokens = description.split(/[,.;\s]+/).filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (normTitle.includes(token)) {
      score += 1;
    }
  }
  return score;
}
