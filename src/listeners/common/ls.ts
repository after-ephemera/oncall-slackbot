import { getOncallSlackMembers } from "@api/oncall";
import { makeOncallMappingMessage } from "@api/pd";


const handleLsCommand = async (
  threadTs: string,
  say:Function,
) => {
    const slackMembers = await getOncallSlackMembers();
    const usersMessage = makeOncallMappingMessage(slackMembers);
    await say({
      text: `Current oncall listing:\n ${usersMessage}`,
      thread_ts: threadTs,
    });
};

export default handleLsCommand;
