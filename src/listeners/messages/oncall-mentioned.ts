import {
  type AllMiddlewareArgs,
  type SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { getOncallSlackMembers } from "@api/oncall";
import { oncallMap } from "@api/pd";
import { type OncallSlackUser } from "@srcapi/slack";

const oncallMentionedCallback = async ({
  context,
  event,
  say,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<"message">): Promise<void> => {
  console.log("**** oncall mentioned");
  const oncallTagged = context.matches[1];
  const oncalls = await getOncallSlackMembers();
  const scheduleId = oncallMap[oncallTagged];
  const oncallUser = oncalls.find(
    (oncall: OncallSlackUser) => oncall.pdScheduleId === scheduleId
  );
  if (oncallUser === undefined) {
    await say({ text: "no oncall user found", thread_ts: event.ts });
    console.error("no oncall user found");
  } else {
    try {
      await say({
        text: `<@${oncallUser.slackId}> ^^`,
        thread_ts: event.ts,
      });
    } catch (error) {
      console.error(error);
    }
  }
};

export default oncallMentionedCallback;
