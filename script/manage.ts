import * as TelegramBot from 'node-telegram-bot-api';
import {User} from 'node-telegram-bot-api';

const AUTHORIZED_USERS = new Set<number>();
try {
  // tslint:disable-next-line
  const data = require(`../authorized.json`);
  for (const [name, id] of Object.entries(data)) {
    console.log(`Added ${name} as authorized`);
    AUTHORIZED_USERS.add(id);
  }
} catch (e) {
  console.log(`Authorized users list not loaded`);
}

export interface Manage {
  auth(callback: (...args: any[]) => void): (...args: any[]) => void;

  isAuthorized(user?: User): boolean;
}

class UserManage implements Manage {

  private allowedUserIdSet = new Set<number>(AUTHORIZED_USERS);

  constructor(rootUserId: number) {
    this.allowedUserIdSet.add(rootUserId);
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

export const init = (rootUserId: number) => {
  return new UserManage(rootUserId);
};
