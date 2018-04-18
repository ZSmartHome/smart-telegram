import {config} from 'dotenv';
import {init} from "./script/bot";

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
      timeout: 500
    }
  }
};

const proxy = process.env.PROXY;
if (proxy) {
  clientConfig.request = {proxy}
}


init(token, rootIdNumber, clientConfig);

