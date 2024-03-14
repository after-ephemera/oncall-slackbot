import { type App } from "@slack/bolt";
import events from "./events/index";
import messages from "./messages/index";

const registerListeners = async (app: App): Promise<void> => {
  events.register(app);
  await messages.register(app);
};

export default registerListeners;
