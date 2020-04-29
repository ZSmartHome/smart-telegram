import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './base/command';
import {Manage} from '../manage';
import {Url} from 'url';
import {get} from 'http';

export default class CameraCommand extends Command {
  public name = `camera`;
  public description = `Sends camera picture`;
  public pattern = `\/${this.name}`;

  constructor(bot: TelegramBot,
              manage: Manage,
              private readonly url: Url) {
    super(bot, manage);
  }

  public handle(msg: TelegramBot.Message): void {
    // 'msg' is the received Message from Telegram

    const chatId = msg.chat.id;

    get(this.url, (response) => {
      const statusCode = response.statusCode;
      if (statusCode !== 200) {
        this.bot.sendMessage(chatId, `Failed to fetch media. Response code: ${statusCode}`);
      } else {
        response.on('error', (e) => {
          this.bot.sendMessage(chatId, `Failed to fetch media. Error: ${e.message}`);
        });
        // @ts-ignore
        response.path = `camera.jpg`; // NB! Due to issue in library check set this always
        this.bot.sendPhoto(chatId, response);
        const root = this.manage.root;
        if (chatId !== root) {
          this.bot.sendPhoto(root, response);
        }
      }
    }).on('error', (e) => {
      this.bot.sendMessage(chatId, `Failed to fetch media. Error: ${e.message}`);
    });
  }
}
