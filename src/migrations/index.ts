import * as migration_20261105_143413_initial from './20261105_143413_initial';

export const migrations = [
  {
    up: migration_20261105_143413_initial.up,
    down: migration_20261105_143413_initial.down,
    name: '20261105_143413_initial'
  },
];
