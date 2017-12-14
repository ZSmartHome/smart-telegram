import * as TelegramBot from 'node-telegram-bot-api';
import {config} from 'dotenv';

config();
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN as string;

// Create a bot that uses 'polling' to fetch new updates

const CONFIG = {
  polling: {
    params: {
      timeout: 500
    }
  }
};
const bot = new TelegramBot(token, CONFIG);

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match![1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});
