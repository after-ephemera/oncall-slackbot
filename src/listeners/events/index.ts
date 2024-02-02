import { type App } from "@slack/bolt";
import appMentionedCallback from "./app-mentioned";

const register = (app: App): void => {
  app.event("app_mention", appMentionedCallback);
};

export default { register };
