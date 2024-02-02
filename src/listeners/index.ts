import { type App } from "@slack/bolt";
import events from "./events/index";
import messages from "./messages/index";

const registerListeners = (app: App): void => {
  events.register(app);
  messages.register(app);
};

export default registerListeners;
