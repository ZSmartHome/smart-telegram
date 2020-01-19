import * as TelegramBot from 'node-telegram-bot-api';
import {User} from 'node-telegram-bot-api';

export interface Manage {
  readonly root: number;

  auth(callback: (...args: any[]) => void): (...args: any[]) => void;

  isAuthorized(user?: User): boolean;
}

class UserManage implements Manage {
  public readonly root: number;
  private allowedUserIdSet = new Set<number>();

  constructor(authorized: number[]) {
    this.root = authorized[0];
    this.allowedUserIdSet = new Set<number>(authorized);
  }

  public isAuthorized(user?: User): boolean {
    if (!user) {
      return false;
    }

    return this.allowedUserIdSet.has(user.id);
  }

  public auth(fn: (...args: any[]) => void): (...args: any[]) => void {
    return (...args: any[]) => {

      const message = args[0] as TelegramBot.Message;
      if (!message) {
        return;
      }

      if (!this.isAuthorized(message.from)) {
        return;
      }

      fn(...args);
    };
  }
}

export const init = (authorized: number[]) => {
  return new UserManage(authorized);
};
