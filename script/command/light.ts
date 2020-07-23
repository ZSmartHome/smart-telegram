import * as TelegramBot from 'node-telegram-bot-api';
import {each, split} from '../util';
import CallbackCommand from './base/callbackcommand';
import {light, lightCommands} from '@zsmarthome/command-core';

const keys = each(lightCommands).map(([it, _]) => it.toLowerCase());
const COMMAND_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    keyboard: split(keys.map((it) => ({text: `/light ${it}`})), 2, 3, 3, 1),
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};
const INLINE_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    inline_keyboard: split(each(lightCommands).map(([command, option]) => ({
      text: option.label,
      callback_data: `light:${command.toLowerCase()}`,
    })), 2, 3, 3, 1),
  },
};

export default class LightCommand extends CallbackCommand {
  public readonly name = `light`;
  public readonly description = `Controls light-set`;
  public readonly pattern = `\/${this.name}.?(${(keys.join(`|`))})?`;

  public handleMessage(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;
    const command = match[1];

    if (!command) {
      this.bot.sendMessage(chatId, `What should I do with Light?`, INLINE_KEYBOARD);
      return;
    }

    light(command)
      .then(() => this.bot.sendMessage(chatId, `Lamp has received you message`))
      .catch((error) => this.bot.sendMessage(chatId, error, COMMAND_KEYBOARD));
  }

  protected async handleCallback(callback: TelegramBot.CallbackQuery): Promise<boolean | Error> {
    const [name, command] = (callback.data || ``).split(`:`);

    if (name !== this.name) {
      return false;
    }

    return light(command)
      .then(() => this.answer(callback.id, `Lamp has received you message`))
      .catch((error) => this.answer(callback.id, error));
  }
}
