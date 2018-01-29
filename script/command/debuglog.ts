import * as TelegramBot from "node-telegram-bot-api";
import {Command} from "../command";

export default class DebugCommand extends Command {

  readonly name = `[anything]`;
  readonly description = `Prints all sent text to you back`;
  readonly pattern = `.*`;

  // Listen for any kind of message. There are different kinds of
  // messages.
  handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    this.bot.sendMessage(chatId, `Received your message: ${msg.text}`);
  }
}
