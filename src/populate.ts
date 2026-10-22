import { bootstrap, DefaultLogger, LogLevel } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import path from 'path';
import { config } from './vendure-config';

// One-off script: creates the schema in the (empty) Postgres DB and loads the base data
// (zones, tax, shipping, payment) only; there is no product catalog. Run with `npm run populate`.
// Products are created on demand by the addConfiguredItemToOrder mutation (cart-logic plugin).
const seedDir = path.join(__dirname, '../seed');

populate(
    () =>
        bootstrap({
            ...config,
            apiOptions: { ...config.apiOptions, port: 3099 },
            dbConnectionOptions: { ...config.dbConnectionOptions, synchronize: true },
            logger: new DefaultLogger({ level: LogLevel.Info }),
            importExportOptions: { importAssetsDir: path.join(seedDir, 'images') },
        }),
    path.join(seedDir, 'initial-data.json'),
)
    .then(app => app.close())
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
