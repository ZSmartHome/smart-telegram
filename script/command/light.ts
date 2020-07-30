import * as TelegramBot from 'node-telegram-bot-api';
import CallbackCommand from './base/callbackcommand';
import {light, lightCommands, split} from '@zsmarthome/command-core';

const BUTTONS_LAYOUT = [2, 3, 4];

const commands = Object.values(lightCommands);
const COMMAND_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    keyboard: split(commands.map((it) => ({text: `/light ${it.command}`})), ...BUTTONS_LAYOUT),
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};
const INLINE_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    inline_keyboard: split(commands.map((it) => ({
      text: it.label,
      callback_data: `light:${it.command}`,
    })), ...BUTTONS_LAYOUT),
  },
};

export default class LightCommand extends CallbackCommand {
  public readonly name = `light`;
  public readonly description = `Controls light-set`;
  public readonly pattern = `\/${this.name}.?(${(commands.map((it) => it.command).join(`|`))})?`;

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
