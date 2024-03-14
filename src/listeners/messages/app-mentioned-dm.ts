import {
  KnownEventFromType,
  type AllMiddlewareArgs,
  type SlackEventMiddlewareArgs,
  GenericMessageEvent,
  MessageChangedEvent,
} from "@slack/bolt";
import handleVersionCommand from "@srclisteners/common/version";
import handleHelpCommand from "@srclisteners/common/help";
import handleLsCommand from "@srclisteners/common/ls";

const USER_MENTION_REGEX = "<@U[A-Z0-9]{8,10}>.*";

const shouldHandleCommand = (
  channelType: string,
  messageText: string
): boolean => {
  if (channelType == "im") {
    // always handle direct messages because the bot only sees its own DMs
    return true;
  }
  // outside of DMs ignore
  return false;
};

const getMessageFrom = (messageEvent: KnownEventFromType<"message">) => {
  // we have to handle the MessageChangedEvent case so we need to do some type
  // hackery to make sure we get the message text out.
  return (
    (messageEvent as GenericMessageEvent)?.text ||
    ((messageEvent as MessageChangedEvent)?.message as GenericMessageEvent)
      ?.text ||
    ""
  );
};

export const appMentionedDmVersionCallback = async ({
  message,
  event,
  say,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">): Promise<void> => {
  if (shouldHandleCommand(event.channel_type, getMessageFrom(message))) {
    handleVersionCommand(event.ts, say);
  }
};

export const appMentionedDmHelpCallback = async ({
  message,
  event,
  say,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">): Promise<void> => {
  if (shouldHandleCommand(event.channel_type, getMessageFrom(message))) {
    handleHelpCommand(event.ts, say);
  }
};

export const appMentionedDmLsCallback = async ({
  message,
  event,
  say,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">): Promise<void> => {
  if (shouldHandleCommand(event.channel_type, getMessageFrom(message))) {
    handleLsCommand(event.ts, say);
  }
};
