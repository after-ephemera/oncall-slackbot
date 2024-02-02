import app from "@src/app";
import jsonConfig from "config";
import { type BotConfig, type Email } from "@types";
import { type UsersListResponse } from "@slack/web-api";
import { type Member } from "@slack/web-api/dist/response/UsersListResponse";
import NodeCache from "node-cache";
const config: BotConfig = jsonConfig as BotConfig;

export type { Member } from "@slack/web-api/dist/response/UsersListResponse";

export class OncallSlackUser {
  name: string;
  email: string;
  pdId: string;
  pdScheduleId: string;
  slackId: string;

  constructor(
    name: string,
    email: string,
    pdId: string,
    pdScheduleId: string,
    slackId: string
  ) {
    this.name = name;
    this.email = email;
    this.pdId = pdId;
    this.pdScheduleId = pdScheduleId;
    this.slackId = slackId;
  }
}

export default class SlackApi {
  cache: NodeCache;
  cacheInterval: number;

  constructor() {
    this.cache = new NodeCache();
    this.cacheInterval = config.slack.cache_interval_seconds;
    void this.getUsers();
  }

  getUsers = async (): Promise<UsersListResponse> => {
    const cachedUsers: UsersListResponse | undefined =
      this.cache.get("allUsers");
    if (cachedUsers !== undefined) {
      return cachedUsers;
    }
    const usersResult = app.client.users
      .list({
        limit: 1000,
      })
      .then((result) => {
        return result;
      });
    this.cache.set("allUsers", usersResult, this.cacheInterval);
    return await usersResult;
  };

  getUser = async (email: Email): Promise<Member> => {
    const cachedUser = this.cache.get(email);
    if (cachedUser !== undefined) {
      return cachedUser as Member;
    } else {
      const allUsers = await this.getUsers();
      if (allUsers.members === undefined) {
        throw new Error("No users found");
      }
      const user = allUsers.members.find(
        (u: Member) => u.profile?.email === email
      );
      this.cache.set(email, user);
      if (user === undefined) {
        throw new Error(`No user found with email: ${email}`);
      }
      return user;
    }
  };
}
