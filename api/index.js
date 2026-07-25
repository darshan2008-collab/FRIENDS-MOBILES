import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Import main Express app from server
const app = require('../server/server.js');

export default app;

