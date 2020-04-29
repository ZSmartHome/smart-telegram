import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './base/command';
import {Manage} from '../manage';

export default class HelpCommand extends Command {
  public name = `help`;
  public description = `Prints help and usages info`;
  public pattern = `\/help`;
  public authRequired = false;

  constructor(bot: TelegramBot,
              manage: Manage,
              private readonly commands: Command[]) {
    super(bot, manage);
  }

  public handleMessage(msg: TelegramBot.Message): void {
    this.bot.sendMessage(msg.chat.id, `List of available commands:\n${this.commands
      .map((it) => `/${it.name} — ${it.description}`)
      .join(`\n`)}`, {parse_mode: `Markdown`});
  }

}
