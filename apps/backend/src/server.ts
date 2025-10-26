import { createApp } from './setup/app.js';
import { loadConfiguration } from './setup/configuration.js';

async function bootstrap() {
  const config = loadConfiguration();
  const app = await createApp(config);
  const port = config.port;
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Fatal error during startup', error);
  process.exit(1);
});
