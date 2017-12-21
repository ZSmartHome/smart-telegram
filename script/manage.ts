import * as TelegramBot from "node-telegram-bot-api";
import {User} from "node-telegram-bot-api";

export interface Manage {
  auth(callback: (...args: any[]) => void): (...args: any[]) => void;

  isAuthorized(user?: User): boolean;
}

class UserManage implements Manage {

  private allowedUserIdSet = new Set<number>();

  constructor(rootUserId: number) {
    this.allowedUserIdSet.add(rootUserId);
  }

  isAuthorized(user?: User): boolean {
    if (!user) {
      return false;
    }

    return this.allowedUserIdSet.has(user.id);
  }

  auth(fn: (...args: any[]) => void): (...args: any[]) => void {
    return (...args: any[]) => {

      const message = args[0] as TelegramBot.Message;
      if (!message) {
        return;
      }

      if (!this.isAuthorized(message.from)) {
        return;
      }

      fn(...args);
    }
  }
}

export const init = (rootUserId: number) => {
  return new UserManage(rootUserId);
};