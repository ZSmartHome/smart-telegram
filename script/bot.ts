import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './command/base/command';
import Echo from './command/echo';
import Light from './command/light';
import Me from './command/me';
import Help from './command/help';
import TV from './command/tv';
import Start from './command/start';
import Camera from './command/camera';
import {URL} from 'url';
import {init as manageInit, Manage} from './manage';

interface CommandConstructor {
  new(bot: TelegramBot, manage: Manage, ...params: any[]): Command;
}

export const init = (token: string, authorized: number[], config: any) => {
  const rootId = authorized[0];
  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, config);
  const manage = manageInit(authorized);

  const setup = (ctor: CommandConstructor, ...params: any[]): Command => new ctor(bot, manage, ...params);

  const commands = [
    setup(Echo),
    setup(TV),
    setup(Light),
    setup(Me),
    setup(InlineKeyboard),
    // setup(Debug), Disable debug
  ];

  const cameraUrl = process.env.CAMERA_URL; // TODO: init all vars in one place
  if (cameraUrl) {
    commands.push(setup(Camera, new URL(cameraUrl)));
  }

  commands.push(setup(Help, commands));

  setup(Start);

  // If we debug locally, we can just handle this error
  bot.on('polling_error', (error) => console.error(`POLL_ERROR: ${error.message}`));
  bot.on('error', (error) => console.error(`FATAL_ERROR: ${error.message}`));

  bot.sendMessage(rootId, `I'm started successfully at ${(new Date()).toLocaleString()}.`);
  bot.sendMessage(rootId, `List of available commands:\n${commands.map((it) => `/${it.name}`).join(`\n`)}`);
};
