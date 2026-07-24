import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Forward execution to main Express server in server/server.js
require('./server/server.js');
