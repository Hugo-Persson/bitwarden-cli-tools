import {
  BitwardenItem,
  deleteItem,
  getItems,
  updateItem,
  Uris,
} from "./bitwarden-wrapper.js";
import inquirer from "inquirer";

const groups: Map<string, Array<BitwardenItem>> = new Map();

async function main() {
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: ["mergeItems", "searchPassword", "duplicatePassword", "nothing"],
    },
  ]);
  console.log(answer);
  if (answer.action == "mergeItems") {
    const answer = mergeItems();
  } else if (answer.action === "searchPassword") {
    searchPassword();
  } else if (answer.action === "duplicatePassword") {
    duplicatePasswords();
  }
}

async function searchPassword() {
  const answer = await inquirer.prompt([
    {
      type: "password",
      name: "pass",
      message: "What password do you want to search for?",
    },
  ]);
  const password = answer.pass;
  const items = await getItems();
  const matches = items
    .filter((e) => e.login?.password?.includes(password))
    .map((e) => {
      return {
        name: e.name,
        username: e.login?.username,
        uri: e.login?.uris.map((u) => u.uri),
      };
    });
  console.log(matches);
}

async function duplicatePasswords() {
  let duplicates: Map<string, Array<BitwardenItem>> = new Map();

  const items = await getItems();
  items.map((e) => {
    if (!e.login) return;
    const password = e.login.password || "";
    if (!duplicates.has(password)) duplicates.set(password, []);
    duplicates.get(password)?.push(e);
  });
  for (let [key, value] of duplicates) {
    console.clear();

    if (value.length > 1) {
      const presentEntries = value.map((e) => {
        return {
          name: e.name,
          username: e.login?.username,
          uri: e.login?.uris.map((u) => u.uri),
        };
      });
      console.log(`These entries share the password ${key}`, presentEntries);

      const mergeAnswer = await inquirer.prompt([
        {
          type: "confirm",
          name: "ok",
          message: "Do you want to merge any these entries?",
        },
      ]);
      if (mergeAnswer.ok) {
        const whichOnes = await inquirer.prompt([
          {
            type: "checkbox",
            message: "Select the entries to combine",
            name: "which",
            choices: transformItemsToList(value),
          },
        ]);
        await doMerge(
          value.filter((e, index) => whichOnes.which.includes(index))
        );
        console.clear();
      }
    }
  }
}

function transformItemsToList(items: Array<BitwardenItem>) {
  return items.map((e, index) => {
    return {
      name: `name: ${e.name}, username: ${e.login?.username}`,
      value: index,
    };
  });
}

async function doMerge(items: Array<BitwardenItem>) {
  console.clear();
  const indexToKeep = await inquirer.prompt([
    {
      type: "list",
      name: "index",
      message: "What do you want to do?",
      choices: transformItemsToList(items),
    },
  ]);
  const itemToKeep = items[indexToKeep.index];
  items.splice(indexToKeep.index, 1);
  console.log("Item to keep", itemToKeep);
  if (!itemToKeep?.login?.uris) {
    console.error("ERRROR ");
    return;
  }
  const urisToAdd: Uris[] = items
    .flatMap((e) => e.login?.uris)
    .filter((e) => e != undefined) as Uris[];
  itemToKeep.login.uris = [...itemToKeep?.login?.uris, ...urisToAdd];
  items.map((e) => itemToKeep?.login?.uris);
  await updateItem(itemToKeep.id, JSON.stringify(itemToKeep));
  await Promise.all(items.map((e) => deleteItem(e.id)));
}

async function mergeItems() {
  const items = await getItems();
  items.map((e) => {
    if (!e.login) return;
    const topLevels = e.login.uris.map((u) => {
      const chunks = new URL(u.uri).hostname.split(".");
      return chunks[chunks.length - 2];
    });
    if (topLevels[0].includes("https")) console.log(e.login.uris);
    console.log(topLevels);
  });
}
main();
