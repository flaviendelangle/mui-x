import childProcess from 'child_process';

const pnpmUpdate = childProcess.spawnSync(
  'pnpm',
  [
    'update',
    '-r',
    '@mui/material@6.x',
    '@mui/system@6.x',
    '@mui/icons-material@6.x',
    '@mui/utils@6.x',
    '@mui/material-nextjs@6.x',
    '@mui/styles@6.x',
    '@mui/lab@6.0.0-beta.14',
  ],
  {
    shell: true,
    stdio: ['inherit', 'inherit', 'inherit'],
  },
);

process.exit(pnpmUpdate.status);
