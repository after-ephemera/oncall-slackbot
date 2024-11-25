import { getOncallSlackMembers } from '@api/oncall';
import { makeOncallMappingMessage } from '@api/pd';

const handleLsCommand = async (threadTs: string, say: Function) => {
  const slackMembers = await getOncallSlackMembers();
  const usersMessage = makeOncallMappingMessage(slackMembers);
  console.log(`total slack members: ${slackMembers.length}`);
  // console.log('slack members:', JSON.stringify(slackMembers, null, 2));
  console.log(
    `tom user: ${JSON.stringify(
      slackMembers.find(
        (s) =>
          s.name.toLowerCase().includes('thom') ||
          s.name.toLowerCase().includes('tom')
      ),
      null,
      2
    )}`
  );
  await say({
    text: `Current oncall listing:\n ${usersMessage}`,
    thread_ts: threadTs,
  });
};

export default handleLsCommand;
