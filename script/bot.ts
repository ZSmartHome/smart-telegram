import * as TelegramBot from "node-telegram-bot-api";
import Echo from "./echo";
import TV from "./tv";
import Me from "./me";
import Debug from "./debuglog";
import {init as manageInit, Manage} from "./manage";
import {Command} from "./command";

const CONFIG = {
  polling: {
    params: {
      timeout: 500
    }
  }
};

interface CommandConstructor {
  new (bot: TelegramBot, manage: Manage): Command;
}

const EMPTY:Array<string> = [];
const EMPTY_REGEXP:RegExpExecArray = EMPTY as RegExpExecArray;

export const init = (token: string, rootId: number) => {
  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, CONFIG);
  const manage = manageInit(rootId);

  const setup = (ctor: CommandConstructor): Command => {
    const command = new ctor(bot, manage);
    const regExp = new RegExp(command.pattern, `i`);
    const handle = (command.authRequired ? manage.auth(command.handle) : command.handle).bind(command);
    bot.onText(regExp, (msg, match) => handle(msg, match || EMPTY_REGEXP));
    return command;
  };

  const commands = [
    setup(Echo),
    setup(TV),
    setup(Me),
    setup(Debug)
  ];

  bot.sendMessage(rootId, `I'm started successfully at ${(new Date()).toLocaleString()}`);
};