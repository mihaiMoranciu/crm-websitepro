import * as migration_20261105_143413_initial from './20261105_143413_initial';
import * as migration_20261110_114701_upgrade_3_93 from './20261110_114701_upgrade_3_93';

export const migrations = [
  {
    up: migration_20261105_143413_initial.up,
    down: migration_20261105_143413_initial.down,
    name: '20261105_143413_initial',
  },
  {
    up: migration_20261110_114701_upgrade_3_93.up,
    down: migration_20261110_114701_upgrade_3_93.down,
    name: '20261110_114701_upgrade_3_93'
  },
];
