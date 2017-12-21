import * as TelegramBot from "node-telegram-bot-api";
import {setup as echo} from "./echo";
import {setup as tv} from "./tv";
import {setup as me} from "./me";
import {setup as debug} from "./debuglog";
import {init as manageInit} from "./manage";

const CONFIG = {
  polling: {
    params: {
      timeout: 500
    }
  }
};

export const init = (token: string, rootId: number) => {
  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, CONFIG);
  const manage = manageInit(rootId);

  echo(bot);
  tv(bot, manage);
  me(bot, manage);
  debug(bot);

  bot.sendMessage(rootId, `I'm started successfully at ${Date.now().toLocaleString()}`);
};