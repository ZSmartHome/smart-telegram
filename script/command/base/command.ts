import * as TelegramBot from 'node-telegram-bot-api';
import {Manage} from '../../manage';

const EMPTY: string[] = [];
const EMPTY_REGEXP: RegExpExecArray = EMPTY as RegExpExecArray;

export abstract class Command {

  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly pattern: string;
  public authRequired = true;

  constructor(protected readonly bot: TelegramBot,
              protected readonly manage: Manage) {
    // A dirty hack, to execute right after hierarchy init
    process.nextTick(() => this.subscribe());
  }

  public abstract handleMessage(msg: TelegramBot.Message, match: RegExpExecArray): void;

  protected async message(id: number,
                          msg: string,
                          options?: TelegramBot.SendMessageOptions): Promise<TelegramBot.Message | Error> {
    return this.bot.sendMessage(id, msg, options);
  }

  protected subscribe() {
    const regExp = new RegExp(this.pattern, `i`);
    const handle = this.handleMessage.bind(this);
    const commandHandle = this.authRequired ? this.manage.auth(handle) : handle;
    this.bot.onText(regExp, (msg, match) => commandHandle(msg, match || EMPTY_REGEXP));
  }
}
