import { type App } from "@slack/bolt";
import oncallMentionedCallback from "./oncall-mentioned";
import {
  appMentionedDmHelpCallback,
  appMentionedDmLsCallback,
  appMentionedDmVersionCallback,
} from "@src/listeners/messages/app-mentioned-dm";
import { oncallMap } from "@api/pd";

// These regexes allow for DM messages to the bot without the mention
const VERSION_REGEX = new RegExp(`^version$`);
const LS_REGEX = new RegExp(`^ls$`);
const HELP_REGEX = new RegExp(`^help$`);

const register = async (app: App): Promise<void> => {
  // This regex matches any string that contains a mention of any of the oncall shortnames.
  // Updating the config requires a restart of the service.
  const allShortnamesRegex = new RegExp(
    `.*@(${Object.keys(oncallMap).join("|")})\\b.*`
  );
  console.log("**** allShortnamesRegex", allShortnamesRegex);
  app.message(allShortnamesRegex, oncallMentionedCallback);

  app.message(VERSION_REGEX, appMentionedDmVersionCallback);
  app.message(LS_REGEX, appMentionedDmLsCallback);
  app.message(HELP_REGEX, appMentionedDmHelpCallback);
};

export default { register };
