import * as TelegramBot from 'node-telegram-bot-api';
import {each, shell, split} from '../util';
import Option from './base/option';
import CallbackCommand from './base/callbackcommand';

/*
# Switch on
  echo "on 0" | cec-client -s
# Switch off
  echo "standby 0" | cec-client -s
# Switch HDMI port to 1
  echo "tx 4F:82:10:00" | cec-client -s
*/
const cec = (action: string): string => `echo "${action}" | cec-client -s -d 1`;

const TvCommand: { [command: string]: Option<string> } = {
  on: {name: `On 💡`, value: cec(`on 0`)},
  off: {name: `Off 💡`, value: cec(`standby 0`)},

  chromecast: {name: `Chromecast 📽️`, value: cec(`tx 4F:82:10:00`)},
  raspberry: {name: `Raspberry 🖥️`, value: cec(`tx 4F:82:20:00`)},
  hdmi: {name: `HDMi 💻`, value: cec(`tx 4F:82:30:00`)},
};

const keys = Object.keys(TvCommand).map((it) => it.toLowerCase());
const COMMAND_KEYBOARD = {
  reply_markup: {
    keyboard: split(keys.map((it) => ({text: `/tv ${it}`})), 2, 3),
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};

const INLINE_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    inline_keyboard: split(each(TvCommand).map(([command, option]) => ({
      text: option.name,
      callback_data: `tv:${command}`,
    })), 2, 3),
  },
  disable_notification: true,
};

export default class TVCommand extends CallbackCommand {
  public readonly name = `tv`;
  public readonly description = `Controls TV-set`;
  public readonly pattern = `\/${this.name}.?(${(keys.join(`|`))})?`;

  public handleMessage(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;
    const command = match[1];
    if (!command) {
      this.message(chatId, `What should I do with TV?`, INLINE_KEYBOARD);
      return;
    }
    const action = TvCommand[command];
    if (!action) {
      const message = `Unsupported command: ${command}`;
      console.error(message);
      this.message(chatId, message, COMMAND_KEYBOARD);
      return;
    }

    shell(action.value)
      .catch((errorMessage) => errorMessage)
      .then((message) => this.bot.sendMessage(chatId, message, {disable_notification: true}));
  }

  protected async handleCallback(callback: TelegramBot.CallbackQuery): Promise<boolean | Error> {
    const [name, command] = (callback.data || ``).split(`:`);
    if (name !== this.name) {
      return false;
    }
    const option = command ? TvCommand[command] : null;
    if (!option) {
      const msg = `Invalid command: ${command}`;
      console.error(msg);
      return this.answer(callback.id, msg);
    }
    return shell(option.value)
      .then(() => this.answer(callback.id, `TV has received you message`))
      .catch((error) => this.answer(callback.id, error));

  }

}
