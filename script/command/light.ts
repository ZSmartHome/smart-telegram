import * as TelegramBot from "node-telegram-bot-api";
import {Command} from "../command";
import * as Yeelight from "yeelight2";
import {split} from "../util";

const tryToConnectLamp = () => new Promise<Yeelight.Light>((success, fail) => {
  const timer = setTimeout(() => fail(`Couldn't find lamp in 2000ms`), 2000);
  Yeelight.discover(function (myLight) {
    this.close();
    clearTimeout(timer);
    success(myLight);
  })
});

const Option: { [command: string]: (light: Promise<Yeelight.Light>) => Promise<Yeelight.Light> } = {
  'on': (light) => light.then((it) => it.set_power('on')),
  'off': (light) => light.then((it) => it.set_power('off')),
  'bright': (light) => light.then((it) => it.set_bright(75)),
  'normal': (light) => light.then((it) => it.set_bright(50)),
  'dark': (light) => light.then((it) => it.set_bright(30)),
  'red': (light) => light.then((it) => it.set_rgb(0xFF0000)),
  'blue': (light) => light.then((it) => it.set_rgb(0x0000FF)),
  'green': (light) => light.then((it) => it.set_rgb(0x00FF00)),
};

const keys = Object.keys(Option).map((it) => it.toLowerCase());
const variants = keys.join(`|`);

const KEYBOARD = {
  reply_markup: {
    keyboard: split(keys.map((it) => ({text: `/light ${it}`})), 2, 3, 3),
    one_time_keyboard: true,
    resize_keyboard: true
  }
};

export default class LightCommand extends Command {
  readonly name = `light`;
  readonly description = `Controls light-set`;
  readonly pattern = `\/${this.name}.?(${variants})?`;


  handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;
    const command = match[1];
    if (!command) {
      this.bot.sendMessage(chatId, `What should I do with Light?`, KEYBOARD);
      return;
    }
    const action = Option[command];
    if (!action) {
      const message = `Unsupported command: ${command}`;
      console.error(message);
      this.bot.sendMessage(chatId, message);
      return;
    }

    const lamp = tryToConnectLamp();
    action(lamp)
      .then(() => this.bot.sendMessage(chatId, `Lamp has received you message`))
      .catch((error) => this.bot.sendMessage(chatId, error));
    lamp.catch(() => lamp).then((it) => {
      it.exit();
      console.log(`Connection to lamp closed`);
    });
  }
}