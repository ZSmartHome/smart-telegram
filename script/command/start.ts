import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './base/command';

export default class StartCommand extends Command {
  public name = `start`;
  public description = `Starts dialogue with user`;
  public pattern = `\/start`;
  public authRequired = false;

  public handleMessage(msg: TelegramBot.Message): void {
    const me = msg.from;
    const isAuthorized = this.manage.isAuthorized(me);
    let message;
    if (!isAuthorized) {
      message = `You are not authorized yet to use this bot.`;
    } else {
      message = `You are are authorized already.
Please, use /help command for more info.`;
    }
    this.bot.sendMessage(msg.chat.id, message, {parse_mode: `Markdown`});
  }

}
