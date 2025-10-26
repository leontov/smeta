import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  DATASET_VERSION: z.string().default('v0'),
});

export type BackendConfiguration = {
  port: number;
  datasetVersion: string;
};

export function loadConfiguration(): BackendConfiguration {
  const parsed = schema.parse(process.env);
  return {
    port: parsed.PORT,
    datasetVersion: parsed.DATASET_VERSION,
  };
}
