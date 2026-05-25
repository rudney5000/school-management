import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT_BACKEND, () => {
  console.log(`Backend running on port ${env.PORT_BACKEND}`);
  console.log(`Health: http://localhost:${env.PORT_BACKEND}/api/health`);
});
