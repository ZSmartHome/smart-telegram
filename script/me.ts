import * as TelegramBot from "node-telegram-bot-api";
import {Manage} from "./manage";

export const setup = (bot: TelegramBot, manage: Manage) => {
  // Matches "/echo [whatever]"
  bot.onText(/\/me/, (msg: TelegramBot.Message) => {
    const message = `You are: ${manage.isAuthorized(msg.from) ? `` : `not`} authorized`;
    bot.sendMessage(msg.chat.id, message);
  });
};