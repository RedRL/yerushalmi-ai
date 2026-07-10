import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info('YERUSHALMI.AI API server started', {
    port: env.port,
    nodeEnv: env.nodeEnv,
    clientOrigins: env.clientOrigins,
    storageProvider: env.storageProvider,
    emailConfigured: env.isEmailConfigured,
  });
});
