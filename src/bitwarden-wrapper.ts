import { exec } from "child_process";

function execShellCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      (
        error: any,
        stdout: string | PromiseLike<string>,
        stderr: string | PromiseLike<string>
      ) => {
        if (error) {
          console.warn(error);
          reject(error);
        }
        resolve(stdout ? stdout : stderr);
      }
    );
  });
}

export async function getItems(): Promise<Array<BitwardenItem>> {
  return JSON.parse(await execShellCommand("bw list items"));
}

export async function updateItem(id: string, newData: string) {
  const command = `echo '${newData}' | bw encode | bw edit item ${id}`;
  console.log("Edit the following item", id);
  const res = await execShellCommand(command);
  console.info("Update res", res);
}

export async function deleteItem(id: string) {
  const command = `bw delete item ${id}`;
  console.log("Delete command", command);
  const res = await execShellCommand(command);
  console.info("Delete res", res);
}

// Generated by https://quicktype.io

export interface BitwardenItem {
  object: Object;
  id: string;
  organizationId: null;
  folderId: null | string;
  type: number;
  reprompt: number;
  name: string;
  notes: null | string;
  favorite: boolean;
  login?: Login;
  collectionIds: any[];
  revisionDate: string;
  deletedDate: null;
  identity?: { [key: string]: null | string };
  passwordHistory?: PasswordHistory[];
  secureNote?: SecureNote;
}

export interface Login {
  uris: Uris[];
  username: null | string;
  password: null | string;
  totp: null;
  passwordRevisionDate: null | string;
}

export interface Uris {
  match: null;
  uri: string;
}

export enum Object {
  Item = "item",
}

export interface PasswordHistory {
  lastUsedDate: string;
  password: string;
}

export interface SecureNote {
  type: number;
}