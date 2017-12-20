import * as TelegramBot from "node-telegram-bot-api";

export const setup = (bot: TelegramBot) => {
  // Matches "/echo [whatever]"
  bot.onText(/\/echo (.+)/, (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match![1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
  });
};