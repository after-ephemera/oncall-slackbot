import SlackApi, { type Member, OncallSlackUser } from "@api/slack";
import { type PdOncallResult } from "@types";
import pagerDuty from "@api/pd";

export const getOncallSlackMembers = async (): Promise<OncallSlackUser[]> => {
  const oncallSlackMembers: OncallSlackUser[] = [];
  const oncallSlackerNames: string[] = [];
  const pdUsers: PdOncallResult[] = await pagerDuty.getOncalls(null);
  const slack = new SlackApi();
  for (const pdUser of pdUsers) {
    try {
      const slackUser: Member = await slack.getUser(pdUser.user.email);
      oncallSlackMembers.push(
        new OncallSlackUser(
          pdUser.user.name,
          pdUser.user.email,
          pdUser.user.id,
          pdUser.schedule.id,
          slackUser.id ?? ""
        )
      );
      if (slackUser.name !== undefined) {
        oncallSlackerNames.push(slackUser.name);
      }
    } catch (e) {
      console.error(`Error getting slack user for ${pdUser.user.email}`);
    }
  }
  return oncallSlackMembers;
};
