import { type App } from "@slack/bolt";
import oncallMentionedCallback from "./oncall-mentioned";
import {
  appMentionedDmHelpCallback,
  appMentionedDmLsCallback,
  appMentionedDmVersionCallback,
} from "@src/listeners/messages/app-mentioned-dm";
import { oncallMap } from "@api/pd";

const USER_MENTION_REGEX = "<@U[A-Z0-9]{8,10}>";
// These regexes optionally include the bot user mention, allowing for
// DM messages to the bot without the mention
const VERSION_REGEX = new RegExp(`(${USER_MENTION_REGEX} )?version`);
const LS_REGEX = new RegExp(`(${USER_MENTION_REGEX} )?ls`);
const HELP_REGEX = new RegExp(`(${USER_MENTION_REGEX} )?help`);

const register = async (app: App): Promise<void> => {
  // This regex matches any string that contains a mention of any of the oncall shortnames.
  // Updating the config requires a restart of the service.
  const allShortnamesRegex = new RegExp(
    `.*@(${Object.keys(oncallMap).join("|")})\\b.*`
  );
  console.log("**** allShortnamesRegex", allShortnamesRegex);
  app.message(allShortnamesRegex, oncallMentionedCallback);

  const result = await app.client.auth.test();
  let bot_id = result.user_id;
  app.message(VERSION_REGEX, appMentionedDmVersionCallback);
  app.message(LS_REGEX, appMentionedDmLsCallback);
  app.message(HELP_REGEX, appMentionedDmHelpCallback);
};

export default { register };
