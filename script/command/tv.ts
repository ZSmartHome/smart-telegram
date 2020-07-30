import * as TelegramBot from 'node-telegram-bot-api';
import {split} from '../util';
import CallbackCommand from './base/callbackcommand';
import {tv, tvCommands} from '@zsmarthome/command-core';

const BUTTONS_LAYOUT = [2, 3];

const commands = Object.values(tvCommands);

const keys = commands.map((it) => it.command);
const COMMAND_KEYBOARD = {
  reply_markup: {
    keyboard: split(keys.map((it) => ({text: `/tv ${it}`})), ...BUTTONS_LAYOUT),
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};

const INLINE_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    inline_keyboard: split(commands.map((it) => ({
      text: it.label,
      callback_data: `tv:${it.command}`,
    })), ...BUTTONS_LAYOUT),
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

    tv(command)
      .then(() => this.bot.sendMessage(chatId, `TV has received you message`))
      .catch((error) => this.bot.sendMessage(chatId, error, COMMAND_KEYBOARD));
  }

  protected async handleCallback(callback: TelegramBot.CallbackQuery): Promise<boolean | Error> {
    const [name, command] = (callback.data || ``).split(`:`);
    if (name !== this.name) {
      return false;
    }

    return tv(command)
      .then(() => this.answer(callback.id, `TV has received you message`))
      .catch((error) => this.answer(callback.id, error));
  }

}
