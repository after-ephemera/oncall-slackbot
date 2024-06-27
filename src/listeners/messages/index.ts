import { type App, KnownEventFromType, subtype } from '@slack/bolt';
import oncallMentionedCallback from './oncall-mentioned';
import {
  appMentionedDmHelpCallback,
  appMentionedDmLsCallback,
  appMentionedDmVersionCallback,
} from '@src/listeners/messages/app-mentioned-dm';
import { oncallMap } from '@api/pd';

// These regexes allow for DM messages to the bot without the mention
const VERSION_REGEX = new RegExp(`^version$`);
const LS_REGEX = new RegExp(`^ls$`);
const HELP_REGEX = new RegExp(`^help$`);

const register = async (app: App): Promise<void> => {
  // This regex matches any string that contains a mention of any of the oncall shortnames.
  // Updating the config requires a restart of the service.
  const allShortnamesRegex = new RegExp(
    `.*@(${Object.keys(oncallMap).join('|')})\\b.*`
  );
  console.log('**** allShortnamesRegex', allShortnamesRegex);
  app.message(allShortnamesRegex, oncallMentionedCallback);
  app.message(
    async ({
      context,
      message,
      next,
    }: {
      context: any;
      message: KnownEventFromType<'message'>;
      next: any;
    }) => {
      // check for edge case where the "attachments" in the message contains the shortname
      if (
        'attachments' in message &&
        allShortnamesRegex.test(JSON.stringify(message.attachments))
      ) {
        const matches = JSON.stringify(message.attachments).match(
          allShortnamesRegex
        );
        context.matches = matches;
        await next();
      }
    },
    oncallMentionedCallback
  );

  app.message(VERSION_REGEX, appMentionedDmVersionCallback);
  app.message(LS_REGEX, appMentionedDmLsCallback);
  app.message(HELP_REGEX, appMentionedDmHelpCallback);
};

export default { register };
