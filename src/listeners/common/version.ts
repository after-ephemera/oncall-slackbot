import { version, name as packageName } from "package.json";


const handleVersionCommand = async (
  threadTs: string,
  say:Function,
) => {
  // we have to handle the MessageChangedEvent case so we need to do some type
  // hackery to make sure we get the message text out.
    await say({
      text: `I am *${packageName}* and running version ${version}.`,
      thread_ts: threadTs,
    });
};

export default handleVersionCommand;
