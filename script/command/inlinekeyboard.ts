import * as TelegramBot from 'node-telegram-bot-api';
import {CallbackQuery} from 'node-telegram-bot-api';
import {Command} from '../command';
import {Manage} from '../manage';

export default abstract class CallbackCommand extends Command {

  protected constructor(bot: TelegramBot, manage: Manage) {
    super(bot, manage);
    this.onInit();
  }

  protected abstract handleCallback(callback: CallbackQuery): void;

  private onInit() {
    // register callback on init
    this.bot.on(`callback_query`, (q: CallbackQuery) => {
      this.bot.answerCallbackQuery({
        callback_query_id: q.id,
        show_alert: q.data === `alert`,
        text: `Got callback from: ${q.data}`,
      });
    });
  }
}
