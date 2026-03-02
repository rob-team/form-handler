module.exports = {
  apps: [
    {
      name: 'pocketbase',
      script: './backend/pocketbase',
      args: 'serve --http=127.0.0.1:8090',
      cwd: './backend',
      env: {
        TELEGRAM_BOT_TOKEN: '8459565509:AAGEXRs2m8GSgg8U-r_lqSxyrYH1RO7u4uM',
        FRONTEND_URL: 'https://form.thefreemeal.com'
      },
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 1000,
      error_file: '/var/log/pm2/pocketbase-error.log',
      out_file: '/var/log/pm2/pocketbase-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
