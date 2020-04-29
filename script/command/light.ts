import * as TelegramBot from 'node-telegram-bot-api';
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

interface Option {
  name: string;
  execute: (light: Promise<Yeelight.Light>) => Promise<Yeelight.Light>;
}

const OPTIONS: { [command: string]: Option } = {
  on: {name: `On 💡`, execute: (light) => light.then((it) => it.set_power('on'))},
  off: {name: `Off 💡`, execute: (light) => light.then((it) => it.set_power('off'))},
  bright: {name: `Bright ☀️`, execute: (light) => light.then((it) => it.set_bright(75))},
  normal: {name: `Питер 🌤️`, execute: (light) => light.then((it) => it.set_bright(50))},
  dark: {name: `Dark ☁️`, execute: (light) => light.then((it) => it.set_bright(30))},
  red: {name: `🔴`, execute: (light) => light.then((it) => it.set_rgb(0xFF0000))},
  blue: {name: `🔵`, execute: (light) => light.then((it) => it.set_rgb(0x0000FF))},
  green: {name: `🟢`, execute: (light) => light.then((it) => it.set_rgb(0x00FF00))},
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
    inline_keyboard: split(keys.map((command) => ({
      text: `/light ${command}`,
      callback_data: command,
    })), 2, 3, 3),
  },
};

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
    const action = OPTIONS[command];
    if (!action) {
      const message = `Unsupported command: ${command}`;
      console.error(message);
      this.bot.sendMessage(chatId, message);
      return;
    }

    const lamp = tryToConnectLamp();
    action.execute(lamp)
      .then(() => this.bot.sendMessage(chatId, `Lamp has received you message`))
      .catch((error) => this.bot.sendMessage(chatId, error));
    lamp.catch(() => lamp).then((it) => {
      it.exit();
      console.log(`Connection to lamp closed`);
    });
  }

  protected handleCallback(callback: TelegramBot.CallbackQuery): void {
    return;
  }
}
