import * as TelegramBot from "node-telegram-bot-api";
import {Command} from "../command";
import * as Yeelight from "yeelight2";

const light = new Promise<Yeelight.Light>((success, fail) => {
  const timer = setTimeout(() => fail(`Couldn't find light in 2000ms`), 2000);
  Yeelight.discover((myLight) => {
    Yeelight.close();
    clearTimeout(timer);
    console.log(myLight.name);
    success(myLight);
  })
});

const Option: { [command: string]: () => Promise<Yeelight.Light> } = {
  'on': () => light.then((it) => it.set_power('on')),
  'off': () => light.then((it) => it.set_power('off')),
};

const keys = Object.keys(Option).map((it) => it.toLowerCase());
const variants = keys.join(`|`);

export default class LightCommand extends Command {
  readonly name = `light`;
  readonly description = `Controls light-set`;
  readonly pattern = `\/${this.name}.?(${variants})?`;


  handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;
    console.log(match);
    const command = match[1];
    const action = command && Option[command];
    if (!action) {
      const message = `Unsupported command: ${command}`;
      console.error(message);
      this.bot.sendMessage(chatId, message);
      return;
    }

    action().catch((e) => console.error(e));
  }
}