import {
  type AllMiddlewareArgs,
  type SlackEventMiddlewareArgs,
} from "@slack/bolt";
import handleVersionCommand from "@srclisteners/common/version";
import handleHelpCommand from "@srclisteners/common/help";
import handleLsCommand from "@srclisteners/common/ls";

export const appMentionedDmVersionCallback = async ({
  event,
  say,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">): Promise<void> => {
  console.log("channel is ", event.channel_type);
  handleVersionCommand(event.ts, say);
};

export const appMentionedDmHelpCallback = async ({
  event,
  say,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">): Promise<void> => {
  handleHelpCommand(event.ts, say);
};

export const appMentionedDmLsCallback = async ({
  event,
  say,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">): Promise<void> => {
  handleLsCommand(event.ts, say);
};
