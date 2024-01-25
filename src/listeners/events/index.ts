import { App } from '@slack/bolt';
import appHomeOpenedCallback from './app-home-opened';
import appMentionedCallback from './app-mentioned';

const register = (app: App) => {
  app.event('app_mention', appMentionedCallback);
};

export default { register };
