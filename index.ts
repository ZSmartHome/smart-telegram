process.env.NTBA_FIX_319 = `true`;

import {config} from 'dotenv';
import {init} from './script/bot';
import proxy from './script/proxy';

config();
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error(`Bot token was not passed`);
}

const rootId = process.env.ROOT_ID;
if (!rootId) {
  throw new Error(`ROOT_ID is not set`);
}

const rootIdNumber = parseInt(rootId, 10);

const clientConfig: any = {
  polling: {
    params: {
      timeout: 500,
    },
  },
};

clientConfig.request = proxy(process.env.PROXY);

init(token, rootIdNumber, clientConfig);
