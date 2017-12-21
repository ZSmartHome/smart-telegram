import * as TelegramBot from "node-telegram-bot-api";
import {Manage} from "./manage";

export const setup = (bot: TelegramBot, manage: Manage) => {
  // Matches "/me"
  bot.onText(/\/me/, (msg: TelegramBot.Message) => {
    const me = msg.from;
    let message;
    if (!me) {
      message = `You are anonymous =(`;
    } else {
      message = `Here what I know about you:
${me.username} ${me.first_name} ${me.last_name} \
(${manage.isAuthorized(me) ? `` : `not`} authorized)`;
    }
    bot.sendMessage(msg.chat.id, message, {parse_mode: `Markdown`});
  });
};