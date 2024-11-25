import {
  type AllMiddlewareArgs,
  type SlackEventMiddlewareArgs,
} from '@slack/bolt';
import handleVersionCommand from '@srclisteners/common/version';
import handleLsCommand from '@srclisteners/common/ls';
import handleHelpCommand from '@srclisteners/common/help';

const USER_MENTION_REGEX = '^<@U[A-Z0-9]{8,10}>';
const VERSION_REGEX = new RegExp(`${USER_MENTION_REGEX} version`);
const LS_REGEX = new RegExp(`${USER_MENTION_REGEX} ls`);

const appMentionedCallback = async ({
  event,
  say,
}: AllMiddlewareArgs &
  SlackEventMiddlewareArgs<'app_mention'>): Promise<void> => {
  console.log(`**** bot mentioned ${event.text}`);
  const threadTs = event.ts;
  if (event.text.match(VERSION_REGEX) !== null) {
    await handleVersionCommand(threadTs, say);
  } else if (event.text.match(LS_REGEX) !== null) {
    await handleLsCommand(threadTs, say);
  } else {
    // list available commands
    await handleHelpCommand(threadTs, say);
  }
};

export default appMentionedCallback;
