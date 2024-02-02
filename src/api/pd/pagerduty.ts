import { type BotConfig } from "../../types";
import NodeCache from "node-cache";
import jsonConfig from "config";

const config: BotConfig = jsonConfig as BotConfig;

const oncallsParams: Record<string, string | number> = {
  time_zone: "UTC",
  "include[]": "users",
  offset: 0,
  limit: 100000,
};

export interface PdUser {
  name: string;
  email: string;
  id: string;
}

interface PdSchedule {
  id: string;
}

export interface PdOncallResult {
  id?: string;
  user: PdUser;
  schedule: PdSchedule;
}

interface OncallOptions {
  contentIndex: string;
  secondaryIndex: string;
  uri: string;
  params: Record<string, string | number>;
}

/**
 * params object:
 *   domain: String (required)
 *   token: String (required)
 *
 */
class PagerDuty {
  cache: NodeCache;
  cacheInterval: number;
  headers: Headers;
  endpoint: string;
  token: string;

  constructor(options: any) {
    this.headers = new Headers({
      Accept: "application/vnd.pagerduty+json;version=2",
      "Content-Type": "application/json",
      Authorization: "Token token=" + options.pagerduty_token,
    });
    this.endpoint = "https://api.pagerduty.com";
    this.cache = new NodeCache();
    this.token = options.pagerduty_token;
    this.cacheInterval = options.cache_interval_seconds;
  }

  async getAllPaginatedData(options: OncallOptions): Promise<PdOncallResult[]> {
    console.debug("getAllPaginatedData");
    options.params.limit = 100; // 100 is the max limit allowed by pagerduty
    options.params.offset = 0;

    let total = null;
    let items: PdOncallResult[] = [];
    const requestOptions: { headers: Headers; url?: string } = {
      headers: this.headers,
    };

    const pagedCallback = async (
      error: any,
      content?: any
    ): Promise<PdOncallResult[]> => {
      if (error !== null) {
        console.debug("Issues with pagedCallback: " + error);
        return error;
      }

      if (content?.[options.contentIndex] === undefined) {
        error = "Page does not have valid data: " + JSON.stringify(content);
        console.debug(error);
        return error;
      }

      if (content[options.contentIndex].length > 0) {
        items = items.concat(content[options.contentIndex] as PdOncallResult[]);
      }

      options.params.offset = content.offset + content.limit; // Update the offset for the next paging request
      total = content.total;

      items = items.filter((item, _i) => {
        // only add oncalls with a schedule
        return item.schedule;
      });

      if (options.params.offset >= total) {
        return items;
      } else {
        return await requestAnotherPage();
      }
    };

    const requestAnotherPage = async (): Promise<PdOncallResult[]> => {
      console.debug("requesting another page");
      // must use node's built in querystring since qs doesn't build arrays like PagerDuty expects.
      const url =
        this.endpoint +
        options.uri +
        "?" +
        new URLSearchParams({
          ...options.params,
          offset: options.params.offset.toString(),
          limit: options.params.limit.toString(),
        }).toString();
      requestOptions.url = url;

      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        return await pagedCallback(response);
      } else {
        return await pagedCallback(null, await response.json());
      }
    };

    return await requestAnotherPage();
  }

  async getOncalls(params?: any): Promise<PdOncallResult[]> {
    console.debug("pagerduty.getOnCalls");
    const options = {
      contentIndex: "oncalls",
      secondaryIndex: "user",
      uri: "/oncalls",
      params: params ?? oncallsParams,
    };
    let oncalls = this.cache.get(options.contentIndex);
    if (oncalls === undefined) {
      oncalls = this.getAllPaginatedData(options);
      this.cache.set(options.contentIndex, oncalls, this.cacheInterval);
    }
    return oncalls as PdOncallResult[];
  }
}

const pagerDuty: PagerDuty = new PagerDuty(config.get("pagerduty"));
export default pagerDuty;
