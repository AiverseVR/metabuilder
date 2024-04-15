module.exports = {
  apps: [
    {
      name: 'metabuilder',
      script: './dist/main.js',
      args: '',
      exec_mode: 'fork',
      instances: 1,
      kill_timeout: 5000,
      wait_ready: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
