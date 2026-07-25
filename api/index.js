import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('../server/server.js');

export default (req, res) => {
  return app(req, res);
};




