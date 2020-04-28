import * as TelegramBot from 'node-telegram-bot-api';
import {CallbackQuery, InlineKeyboardButton} from 'node-telegram-bot-api';
import {Command} from '../command';
import {Manage} from '../manage';

export default class InlineKeyboard extends Command {
  public name = `test`;
  public description = `Opens test page`;
  public pattern = `\/${this.name}.?(.+)?`;

  constructor(bot: TelegramBot, manage: Manage) {
    super(bot, manage);
    this.onInit();
  }

  // Matches "/echo [whatever]"
  public handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    const createButton = (name: string, data: string): InlineKeyboardButton => {
      return {
        text: name,
        callback_data: data,
      };
    };
    this.bot.sendMessage(chatId, resp, {
      reply_markup: {
        inline_keyboard: [
          [
            createButton(`1, 1`, `bin:11`),
            createButton(`1, 2`, `bin:12`),
          ],
          [
            createButton(`2, 1`, `bin:21`),
            createButton(`2, 2`, `bin:22`),
          ],
          [
            createButton(`Alert`, `alert`),
            createButton(`\u{1F60D}`, `smile`),
          ],
        ],
      },
    });
  }

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
