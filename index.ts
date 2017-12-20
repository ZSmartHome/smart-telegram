import {config} from 'dotenv';
import {init} from "./script/bot";

config();
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN as string;

if (!token) {
  throw new Error(`Bot token was not passed`);
}

init(token);

