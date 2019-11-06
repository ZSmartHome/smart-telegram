process.env.NTBA_FIX_319 = `true`;

import {config} from 'dotenv';
import {init} from './script/bot';
import proxy from './script/proxy';

config();
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
const baseApiUrl = process.env.BASE_API_URL;

if (!token) {
  throw new Error(`Bot token was not passed`);
}

const rootId = process.env.ROOT_ID;
if (!rootId) {
  throw new Error(`ROOT_ID is not set`);
}

const authorized = [parseInt(rootId, 10)];

const allowedUsersList = process.env.AUTHORIZED;
if (allowedUsersList) {
  const allowed = allowedUsersList.split(`,`)
    .map((it) => it.trim())
    .map((it) => parseInt(it, 10))
    .filter((it) => Number.isInteger(it));

  allowed.forEach((it) => authorized.push(it));
  console.log(`I've loaded ${allowed.length} authorized users`);
}

const clientConfig: any = {
  polling: {
    params: {
      timeout: 500,
    },
  },
  baseApiUrl,
};

clientConfig.request = proxy(process.env.PROXY);

init(token, authorized, clientConfig);

process.on('uncaughtException', (err) => {
  console.log(`UNCAUGHT EX: ${err.message}`, err);
});
