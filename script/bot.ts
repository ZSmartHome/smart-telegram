import * as TelegramBot from "node-telegram-bot-api";
import Echo from "./command/echo";
import TV from "./command/tv";
import Light from "./command/light";
import Me from "./command/me";
import Debug from "./command/debuglog";
import {init as manageInit, Manage} from "./manage";
import {Command} from "./command";

interface CommandConstructor {
  new(bot: TelegramBot, manage: Manage): Command;
}

const EMPTY: Array<string> = [];
const EMPTY_REGEXP: RegExpExecArray = EMPTY as RegExpExecArray;

export const init = (token: string, rootId: number, config: any) => {
  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, config);
  const manage = manageInit(rootId);

  const setup = (ctor: CommandConstructor): Command => {
    const command = new ctor(bot, manage);
    const regExp = new RegExp(command.pattern, `i`);
    const handle = command.handle.bind(command);
    const commandHandle = command.authRequired ? manage.auth(handle) : handle;
    bot.onText(regExp, (msg, match) => commandHandle(msg, match || EMPTY_REGEXP));
    return command;
  };

  const commands = [
    setup(Echo),
    setup(TV),
    setup(Light),
    setup(Me),
    setup(Debug)
  ];

  // If we debug locally, we can just handle this error
  bot.on('polling_error', (error) => console.error(error.message));

  bot.sendMessage(rootId, `I'm started successfully at ${(new Date()).toLocaleString()}`);
};