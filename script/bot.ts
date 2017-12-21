import * as TelegramBot from "node-telegram-bot-api";
import {setup as echo} from "./echo";
import {setup as tv} from "./tv";
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
  debug(bot);
};