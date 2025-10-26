import cors from 'cors';
import express from 'express';

import { createEstimateRouter } from '../routes/estimate.js';
import { createNormsRouter } from '../routes/norms.js';
import { BackendConfiguration } from './configuration.js';

export async function createApp(config: BackendConfiguration) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/estimates', createEstimateRouter(config));
  app.use('/api/norms', createNormsRouter(config));

  return app;
}
