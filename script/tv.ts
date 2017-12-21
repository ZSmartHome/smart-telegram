import * as TelegramBot from "node-telegram-bot-api";
import {Manage} from "./manage";
import {shell} from "./util";

/*
# Switch on
  echo "on 0" | cec-client -s
# Switch off
  echo "standby 0" | cec-client -s
# Switch HDMI port to 1
  echo "tx 4F:82:10:00" | cec-client -s
*/
const TvCommand: { [command: string]: string } = {
  'ON': `on 0`,
  'OFF': `standby 0`,

  'CHROMECAST': `tx 4F:82:10:00`,
  'RASPBERRY': `tx 4F:82:20:00`,
  'XBOX': `tx 4F:82:30:00`,
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
      const action = TvCommand[command.toUpperCase()];
      if (!action) {
        const message = `Unsupported command: ${command}`;
        console.error(message);
        bot.sendMessage(chatId, message);
        return;
      }

      shell(`echo "${action}" | cec-client -s -d 1`)
        .catch((errorMessage) => errorMessage)
        .then((message) => bot.sendMessage(chatId, message, {disable_notification: true}));
    }
  };


  bot.onText(new RegExp(`\/tv.?(${variants})?`, `i`), manage.auth(tvAction));

};