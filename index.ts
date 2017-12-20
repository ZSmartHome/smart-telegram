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

const TvCommand = {
  ON: {
    name: `on`,
    shell: `on 0`
  },
  OFF: {
    name: `off`,
    shell: `standby 0`
  }
};

const {exec} = require('child_process');
// Matches "/tv [on|off]"
bot.onText(/\/tv.?(on|off)?/i, (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  console.log(match);
  const command = match && match[1];
  if (!command) {
    bot.sendMessage(chatId, `What should I do with TV?`, {
      reply_markup: {
        keyboard: [
          [
            {text: `/tv ${TvCommand.ON.name}`},
            {text: `/tv ${TvCommand.OFF.name}`}
          ]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  } else {

    let shellCommand;
    switch (command) {
      case TvCommand.ON.name:
        shellCommand = TvCommand.ON.shell;
        break;
      case TvCommand.OFF.name:
        shellCommand = TvCommand.OFF.shell;
        break;
      default:
        const message = `Unsupported command: ${command}`;
        console.error(message);
        bot.sendMessage(chatId, message);
    }
    /*
      # Switch on
        echo "on 0" | cec-client -s
      # Switch off
        echo "standby 0" | cec-client -s
    */
    exec(`echo "${shellCommand}" | cec-client -s`, (error: Error, stdout: string, stderr: string) => {
      if (error) {
        bot.sendMessage(chatId, `exec error: ${error}`);
        return;
      }
      bot.sendMessage(chatId, `stdout: ${stdout}`);
      bot.sendMessage(chatId, `stderr: ${stderr}`);
    });

  }
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, `Received your message: ${msg.text}`);
});
