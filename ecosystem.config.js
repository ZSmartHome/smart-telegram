module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'Smart TelegramBot',
      script: 'build/index.js',
      watch: true
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    dev: {
      user: 'pi',
      host: 'raspberrypi',
      ref: 'origin/master',
      repo: 'https://github.com/zeckson/smart-telegram.git',
      path: '/home/pi/smartbot',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env dev'
    }
  }
};
