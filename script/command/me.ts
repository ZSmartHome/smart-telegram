import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './base/command';

export default class MeCommand extends Command {
  public name = `me`;
  public description = `Prints out current user info`;
  public pattern = `\/me`;
  public authRequired = false;

  public handleMessage(msg: TelegramBot.Message): void {
    const root = this.manage.root;

    const me = msg.from;
    let message;
    if (!me) {
      message = `You are anonymous =(`;
    } else {
      message = `Here what I know about you:
id:${me.id}${root === me.id ? `(root)` : ``} ${me.first_name || ``} ${me.last_name || ``}${me.username ? ` @${me.username}` : ``} \
(${this.manage.isAuthorized(me) ? `` : `not `}authorized)`;
    }
    this.bot.sendMessage(msg.chat.id, message, {parse_mode: `Markdown`});
  }

}
