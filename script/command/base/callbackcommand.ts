import * as TelegramBot from 'node-telegram-bot-api';
import {CallbackQuery} from 'node-telegram-bot-api';
import {Command} from './command';

export default abstract class CallbackCommand extends Command {

  protected abstract handleCallback(callback: TelegramBot.CallbackQuery): Promise<boolean | Error>;

  protected subscribe() {
    super.subscribe();
    // register callback on init
    this.bot.on(`callback_query`, (q: CallbackQuery) => {
      const isAuthorized = this.manage.isAuthorized(q.from);
      if (isAuthorized) {
        this.handleCallback(q);
      } else {
        this.bot.answerCallbackQuery({
          callback_query_id: q.id,
          show_alert: true,
          text: `You are not allowed on this action!`,
        });
      }
    });
  }
}
