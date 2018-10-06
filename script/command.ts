import * as TelegramBot from 'node-telegram-bot-api';
import {Manage} from './manage';

export abstract class Command {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly pattern: string;
  public authRequired = true;
  constructor(protected readonly bot: TelegramBot,
              protected readonly manage: Manage) {}

  public abstract handle(msg: TelegramBot.Message, match: RegExpExecArray): void;
}
