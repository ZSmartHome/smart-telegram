import * as TelegramBot from 'node-telegram-bot-api';
import {AnswerCallbackQueryOptions} from 'node-telegram-bot-api';
import * as Yeelight from 'yeelight2';
import {split} from '../util';
import CallbackCommand from './base/callbackcommand';

const tryToConnectLamp = () => new Promise<Yeelight.Light>((success, fail) => {
  const timer = setTimeout(() => fail(`Couldn't find lamp in 2000ms`), 2000);
  Yeelight.discover(function(myLight) {
    this.close();
    clearTimeout(timer);
    success(myLight);
  });
});

type ExecuteAction = (light: Yeelight.Light) => Promise<Yeelight.Light>;

interface Option {
  name: string;
  execute: ExecuteAction;
}

const OPTIONS: { [command: string]: Option } = {
  on: {name: `On 💡`, execute: (it) => it.set_power('on')},
  off: {name: `Off 💡`, execute: (it) => it.set_power('off')},
  bright: {name: `Bright ☀️`, execute: (it) => it.set_bright(75)},
  normal: {name: `Питер 🌤️`, execute: (it) => it.set_bright(50)},
  dark: {name: `Dark ☁️`, execute: (it) => it.set_bright(30)},
  red: {name: `🔴`, execute: (it) => it.set_rgb(0xFF0000)},
  blue: {name: `🔵`, execute: (it) => it.set_rgb(0x0000FF)},
  green: {name: `🟢`, execute: (it) => it.set_rgb(0x00FF00)},
};
const execute = async (option: Option): Promise<any> => {
  let lamp: Yeelight.Light | undefined;
  try {
    lamp = await tryToConnectLamp();
    return option.execute(lamp);
  } finally {
    if (lamp) {
      console.log(`Closing connection to lamp...`);
      lamp.exit();
      console.log(`Connection to lamp closed`);
    }
  }
};
const keys = Object.keys(OPTIONS).map((it) => it.toLowerCase());
const variants = keys.join(`|`);

const COMMAND_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    keyboard: split(keys.map((it) => ({text: `/light ${it}`})), 2, 3, 3),
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};
const INLINE_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    inline_keyboard: split(Object.entries(OPTIONS).map(([command, option]) => ({
      text: option.name,
      callback_data: command.toLowerCase(),
    })), 2, 3, 3),
  },
};

const answer = (id: string, text: string, alert = false): AnswerCallbackQueryOptions => ({
  callback_query_id: id,
  text,
  show_alert: alert,
});

export default class LightCommand extends CallbackCommand {
  public readonly name = `light`;
  public readonly description = `Controls light-set`;
  public readonly pattern = `\/${this.name}.?(${variants})?`;

  public handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;
    const command = match[1];
    if (!command) {
      this.bot.sendMessage(chatId, `What should I do with Light?`, INLINE_KEYBOARD);
      return;
    }
    const option = OPTIONS[command];
    if (!option) {
      const message = `Unsupported command: ${command}`;
      console.error(message);
      this.bot.sendMessage(chatId, message, COMMAND_KEYBOARD);
      return;
    }

    execute(option)
      .then(() => this.bot.sendMessage(chatId, `Lamp has received you message`))
      .catch((error) => this.bot.sendMessage(chatId, error));
  }

  protected handleCallback(callback: TelegramBot.CallbackQuery): Promise<boolean | Error> {
    const command = callback.data;
    const action = command ? OPTIONS[command] : null;
    if (!action) {
      const msg = `Invalid command: ${command}`;
      console.error(msg);
      return this.bot.answerCallbackQuery(answer(callback.id, msg));
    }
    return execute(action)
      .then(() => this.bot.answerCallbackQuery(answer(callback.id, `Lamp has received you message`)))
      .catch((error) => this.bot.answerCallbackQuery(answer(callback.id, error)));
  }
}
