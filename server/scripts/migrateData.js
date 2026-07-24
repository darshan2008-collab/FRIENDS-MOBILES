const migrateToPostgres = require('./migrateToPostgres');

module.exports = migrateToPostgres;

if (require.main === module) {
  migrateToPostgres().then(() => process.exit(0)).catch(err => {
    console.error('[Migration Error]', err);
    process.exit(1);
  });
}
