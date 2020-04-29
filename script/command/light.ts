import * as TelegramBot from 'node-telegram-bot-api';
import * as Yeelight from 'yeelight2';
import {each, split} from '../util';
import CallbackCommand from './base/callbackcommand';
import Option from './base/option';

const tryToConnectLamp = () => new Promise<Yeelight.Light>((success, fail) => {
  const timer = setTimeout(() => fail(`Couldn't find lamp in 2000ms`), 2000);
  Yeelight.discover(function(myLight) {
    this.close();
    clearTimeout(timer);
    success(myLight);
  });
});

type ExecuteAction = (light: Yeelight.Light) => Promise<Yeelight.Light>;

const OPTIONS: { [command: string]: Option<ExecuteAction> } = {
  on: {name: `On 💡`, value: (it) => it.set_power('on')},
  off: {name: `Off 💡`, value: (it) => it.set_power('off')},
  bright: {name: `Bright ☀️`, value: (it) => it.set_bright(75)},
  normal: {name: `Питер 🌤️`, value: (it) => it.set_bright(50)},
  dark: {name: `Dark ☁️`, value: (it) => it.set_bright(30)},
  red: {name: `🔴`, value: (it) => it.set_rgb(0xFF0000)},
  blue: {name: `🔵`, value: (it) => it.set_rgb(0x0000FF)},
  green: {name: `🟢`, value: (it) => it.set_rgb(0x00FF00)},
};
const execute = async (option: Option<ExecuteAction>): Promise<any> => {
  let lamp: Yeelight.Light | undefined;
  try {
    lamp = await tryToConnectLamp();
    return option.value(lamp);
  } finally {
    if (lamp) {
      console.log(`Closing connection to lamp...`);
      lamp.exit();
      console.log(`Connection to lamp closed`);
    }
  }
};
const keys = each(OPTIONS).map(([it, _]) => it.toLowerCase());
const COMMAND_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    keyboard: split(keys.map((it) => ({text: `/light ${it}`})), 2, 3, 3),
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};
const INLINE_KEYBOARD: TelegramBot.SendMessageOptions = {
  reply_markup: {
    inline_keyboard: split(each(OPTIONS).map(([command, option]) => ({
      text: option.name,
      callback_data: `light:${command.toLowerCase()}`,
    })), 2, 3, 3),
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

  protected async handleCallback(callback: TelegramBot.CallbackQuery): Promise<boolean | Error> {
    const [name, command] = (callback.data || ``).split(`:`);
    if (name !== this.name) {
      return false;
    }
    const action = command ? OPTIONS[command] : null;
    if (!action) {
      const msg = `Invalid command: ${command}`;
      console.error(msg);
      return this.answer(callback.id, msg);
    }
    return execute(action)
      .then(() => this.answer(callback.id, `Lamp has received you message`))
      .catch((error) => this.answer(callback.id, error));
  }
}
