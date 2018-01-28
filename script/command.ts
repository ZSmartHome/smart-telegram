import * as TelegramBot from "node-telegram-bot-api";
import {Manage} from "./manage";

export abstract class Command {
  constructor(protected readonly bot: TelegramBot,
              protected readonly manage: Manage) {}
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly pattern: string;
  authRequired = true;

  abstract handle(msg: TelegramBot.Message, match: RegExpExecArray): void;
}

