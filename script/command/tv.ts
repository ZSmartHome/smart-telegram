import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './base/command';
import {shell, split} from '../util';

/*
# Switch on
  echo "on 0" | cec-client -s
# Switch off
  echo "standby 0" | cec-client -s
# Switch HDMI port to 1
  echo "tx 4F:82:10:00" | cec-client -s
*/
const TvCommand: { [command: string]: string } = {
  on: `on 0`,
  off: `standby 0`,

  chromecast: `tx 4F:82:10:00`,
  raspberry: `tx 4F:82:20:00`,
  xbox: `tx 4F:82:30:00`,
};

const keys = Object.keys(TvCommand).map((it) => it.toLowerCase());
const variants = keys.join(`|`);
const KEYBOARD = {
  reply_markup: {
    keyboard: split(keys.map((it) => ({text: `/tv ${it}`})), 2, 3),
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};

export default class TVCommand extends Command {
  public readonly name = `tv`;
  public readonly description = `Controls TV-set`;
  public readonly pattern = `\/${this.name}.?(${variants})?`;

  public handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;
    const command = match[1];
    if (!command) {
      this.bot.sendMessage(chatId, `What should I do with TV?`, KEYBOARD);
      return;
    }
    const action = TvCommand[command];
    if (!action) {
      const message = `Unsupported command: ${command}`;
      console.error(message);
      this.bot.sendMessage(chatId, message);
      return;
    }

    shell(`echo "${action}" | cec-client -s -d 1`)
      .catch((errorMessage) => errorMessage)
      .then((message) => this.bot.sendMessage(chatId, message, {disable_notification: true}));
  }
}
