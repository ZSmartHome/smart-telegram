import * as TelegramBot from "node-telegram-bot-api";
import {Command} from "./command";

export default class EchoCommand extends Command {
  name = `echo`;
  description = `Echoes sent message back to you`;
  pattern = `\/${this.name} (.+)`;

  // Matches "/echo [whatever]"
  handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    this.bot.sendMessage(chatId, resp);
  }
}