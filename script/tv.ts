import {exec} from "child_process";
import * as TelegramBot from "node-telegram-bot-api";

const TvCommand = {
  ON: {
    name: `on`,
    shell: `on 0`
  },
  OFF: {
    name: `off`,
    shell: `standby 0`
  }
};

export const setup = (bot: TelegramBot) => {

// Matches "/tv [on|off]"
  const tvAction = (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
    const chatId = msg.chat.id;
    console.log(match);
    const command = match && match[1];
    if (!command) {
      bot.sendMessage(chatId, `What should I do with TV?`, {
        reply_markup: {
          keyboard: [
            [
              {text: `/tv ${TvCommand.ON.name}`},
              {text: `/tv ${TvCommand.OFF.name}`}
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    } else {
      let shellCommand;
      switch (command) {
        case TvCommand.ON.name:
          shellCommand = TvCommand.ON.shell;
          break;
        case TvCommand.OFF.name:
          shellCommand = TvCommand.OFF.shell;
          break;
        default:
          const message = `Unsupported command: ${command}`;
          console.error(message);
          bot.sendMessage(chatId, message);
      }
      /*
        # Switch on
          echo "on 0" | cec-client -s
        # Switch off
          echo "standby 0" | cec-client -s
      */
      exec(`echo "${shellCommand}" | cec-client -s`, (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          bot.sendMessage(chatId, `exec error: ${error}`);
          return;
        }
        bot.sendMessage(chatId, `stdout: ${stdout}`);
        bot.sendMessage(chatId, `stderr: ${stderr}`);
      });

    }
  };

  bot.onText(/\/tv.?(on|off)?/i, tvAction);

};