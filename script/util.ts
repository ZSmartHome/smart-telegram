import {exec} from "child_process";

export const shell = (command: string): Promise<string> => {
  return new Promise((onSuccess, onFail) => {
    exec(command,
      (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          onFail(`exec error: ${error}`);
          return
        }
        let message;
        if (stdout || stderr) {
          message = `stdout: ${stdout}\nstderr: ${stderr}`;
        } else {
          message = `Command complete`;
        }
        onSuccess(message);
      });
  });
};