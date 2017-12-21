import * as TelegramBot from "node-telegram-bot-api";
import {Manage} from "./manage";
import {shell} from "./util";

/*
        # Switch on
          echo "on 0" | cec-client -s
        # Switch off
          echo "standby 0" | cec-client -s
      */
const TvCommand: { [command: string]: Array<string> } = {
  'ON': [`on 0`],
  'OFF': [`standby 0`],

  'CHROMECAST': [`as`, `p 0 1`],
  'RASPBERRY': [`as`, `p 0 2`],
  'XBOX': [`as`, `p 0 3`],
};

const keys = Object.keys(TvCommand).map((it) => it.toLowerCase());
const variants = keys.join(`|`);
const buttons = keys.map((it) => ({text: `/tv ${it}`}));

export const setup = (bot: TelegramBot, manage: Manage) => {

  // Matches "/tv [on|off]"
  const tvAction = (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
    const chatId = msg.chat.id;
    console.log(match);
    const command = match && match[1];
    if (!command) {
      bot.sendMessage(chatId, `What should I do with TV?`, {
        reply_markup: {
          keyboard: [
            [
              buttons[0], buttons[1]
            ],
            [
              buttons[2], buttons[3], buttons[4]
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    } else {
      let shellCommand;
      const actions = TvCommand[command.toUpperCase()];
      if (!actions) {
        const message = `Unsupported command: ${command}`;
        console.error(message);
        bot.sendMessage(chatId, message);
        return;
      }

      let current = Promise.resolve(`ok`);
      for (const action of actions) {
        current = current.then(() => shell(`echo "${action}" | cec-client -s`));
      }
      current
        .catch((errorMessage) => errorMessage)
        .then((message) => bot.sendMessage(chatId, message, {disable_notification: true}));
    }
  };


  bot.onText(new RegExp(`\/tv.?(${variants})?`, `i`), manage.auth(tvAction));

};