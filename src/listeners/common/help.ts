import { version, name as packageName } from "package.json";


const handleHelpCommand = async (
  threadTs: string,
  say:Function,
) => {
  // we have to handle the MessageChangedEvent case so we need to do some type
  // hackery to make sure we get the message text out.
    await say({
      text: `You can @ me with the following commands:
  - version
  - ls`,
      thread_ts: threadTs,
    });
};

export default handleHelpCommand;
