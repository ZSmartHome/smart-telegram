import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './command';
import Debug from './command/debuglog';
import Echo from './command/echo';
import Light from './command/light';
import Me from './command/me';
import Help from './command/help';
import TV from './command/tv';
import {init as manageInit, Manage} from './manage';

interface CommandConstructor {
  new(bot: TelegramBot, manage: Manage): Command;
}

const EMPTY: string[] = [];
const EMPTY_REGEXP: RegExpExecArray = EMPTY as RegExpExecArray;

export const init = (token: string, rootId: number, config: any) => {
  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, config);
  const manage = manageInit(rootId);

  const addHandler = (command: Command): Command => {
    const regExp = new RegExp(command.pattern, `i`);
    const handle = command.handle.bind(command);
    const commandHandle = command.authRequired ? manage.auth(handle) : handle;
    bot.onText(regExp, (msg, match) => commandHandle(msg, match || EMPTY_REGEXP));
    return command;
  };

  const setup = (ctor: CommandConstructor): Command => addHandler(new ctor(bot, manage));

  const commands = [
    setup(Echo),
    setup(TV),
    setup(Light),
    setup(Me),
    setup(Debug),
  ];

  commands.push(addHandler(new Help(bot, manage, commands)));

  // If we debug locally, we can just handle this error
  bot.on('polling_error', (error) => console.error(`POLL_ERROR: ${error.message}`));
  bot.on('error', (error) => console.error(`FATAL_ERROR: ${error.message}`));

  bot.sendMessage(rootId, `I'm started successfully at ${(new Date()).toLocaleString()}.`);
  bot.sendMessage(rootId, `List of available commands:\n${commands.map((it) => `/${it.name}`).join(`\n`)}`);
};
