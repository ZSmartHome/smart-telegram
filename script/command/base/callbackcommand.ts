import * as TelegramBot from 'node-telegram-bot-api';
import {CallbackQuery} from 'node-telegram-bot-api';
import {Command} from './command';

export default abstract class CallbackCommand extends Command {

  protected abstract async handleCallback(callback: TelegramBot.CallbackQuery): Promise<boolean | Error>;

  protected async answer(id: string, text: string, alert = false): Promise<boolean | Error> {
    return this.bot.answerCallbackQuery(id,{
      callback_query_id: id,
      text,
      show_alert: alert,
    });
  }

  protected subscribe() {
    super.subscribe();
    // register callback on init
    this.bot.on(`callback_query`, (q: CallbackQuery) => {
      const isAuthorized = this.manage.isAuthorized(q.from);
      if (isAuthorized) {
        this.handleCallback(q);
      } else {
        this.answer(q.id, `You are not allowed on this action!`, true);
      }
    });
  }
}
