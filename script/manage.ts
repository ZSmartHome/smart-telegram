import * as TelegramBot from "node-telegram-bot-api";

export interface Manage {
  auth(callback: (...args: any[]) => void): (...args: any[]) => void;
}

class UserManage implements Manage {
  private allowedUserIdSet = new Set<number>();

  constructor(rootUserId: number) {
    this.allowedUserIdSet.add(rootUserId);
  }

  auth(fn: (...args: any[]) => void): (...args: any[]) => void {
    return (...args: any[]) => {

      const message = args[0] as TelegramBot.Message;
      if (!message) {
        return;
      }

      const from = message.from;
      if (!from) {
        return;
      }

      const userId = from.id;
      if (!this.allowedUserIdSet.has(userId)) {
        return;
      }

      fn(...args);
    }
  }
}

export const init = (rootUserId: number) => {
  return new UserManage(rootUserId);
};