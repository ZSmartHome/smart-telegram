import * as TelegramBot from "node-telegram-bot-api";

export const setup = (bot: TelegramBot) => {

// Listen for any kind of message. There are different kinds of
// messages.
  bot.on('message', (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, `Received your message: ${msg.text}`);
  });
};