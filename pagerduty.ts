/*jslint node: true */
/*globals module: true */

var oncallsParams = {
  time_zone: "UTC",
  "include[]": "users",
};

//
import request from "request";
import async from "async";
import _ from "underscore";
import querystring from "querystring";
import dbg from "debug";
import NodeCache from "node-cache";

const debug = dbg("pagerduty");

export interface PdUser {
  name: string;
  email: string;
  id: string;
}

interface PdSchedule {
  id: string;
}

export interface PdOncallResult {
  user: PdUser;
  schedule: PdSchedule;
}

/**
 * params object:
 *   domain: String (required)
 *   token: String (required)
 *
 **/
class PagerDuty {
  constructor(options) {
    this.headers = {
      Accept: "application/vnd.pagerduty+json;version=2",
      "Content-Type": "application/json",
      Authorization: "Token token=" + options.pagerduty_token,
    };
    this.endpoint = "https://api.pagerduty.com";
    this.cache = new NodeCache();
    this.token = options.pagerduty_token;
    this.cacheInterval = options.cache_interval_seconds;
  }

  getAllPaginatedData(options): void {
    debug("getAllPaginatedData");
    options.params = options.params || {};
    options.params.limit = 100; // 100 is the max limit allowed by pagerduty
    options.params.offset = 0;

    var total = null,
      items: PdOncallResult[] = [],
      self = this,
      requestOptions = {
        headers: self.headers,
        json: true,
        total: true,
      };

    var pagedCallback = function (error, content) {
      if (error) {
        debug("Issues with pagedCallback: " + error);
        return options.callback(error);
      }

      if (!content || !content[options.contentIndex]) {
        error = "Page does not have valid data: " + JSON.stringify(content);
        debug(error);
        return options.callback(new Error(error));
      }

      if (content[options.contentIndex].length > 0) {
        items = items.concat(content[options.contentIndex]);
      }

      options.params.offset = content.offset + content.limit; // Update the offset for the next paging request
      total = content.total;

      // Index the results as a map from id: item
      if (options.sortBy) {
        items.sort(function (a, b) {
          return a[options.sortBy] - b[options.sortBy];
        });
      }

      items = items.filter((item, _i) => {
        let index = item.id || item[options.secondaryIndex].id;
        // only add oncalls with a schedule
        return item.schedule || false;
      });

      if (options.params.offset >= total) {
        options.callback(error, items);
      } else {
        requestAnotherPage();
      }
    };

    var requestAnotherPage = function () {
      debug("requesting another page");
      // must use node's built in querystring since qs doesn't build arrays like PagerDuty expects.
      requestOptions.url =
        self.endpoint +
        options.uri +
        "?" +
        querystring.stringify(options.params);

      request(requestOptions, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          pagedCallback(null, body);
        } else {
          pagedCallback(error);
        }
      });
    };

    requestAnotherPage();
  }

  getOnCalls(params): Promise<PdOncallResult[]> {
    return new Promise<PdOncallResult[]>((resolve, reject) => {
      debug("pagerduty.getOnCalls");
      var options = {
        contentIndex: "oncalls",
        secondaryIndex: "user",
        uri: "/oncalls",
        callback: resolve,
        params: params || oncallsParams,
      };
      var self = this;
      async.auto(
        {
          getCacheData: function (cb) {
            debug("getCacheData");
            self.cache.get(options.contentIndex, cb);
          },
          checkCacheData: [
            "getCacheData",
            function (results, cb) {
              debug("checkCacheData");
              if (results.getCacheData == undefined) {
                options.callback = cb;
                self.getAllPaginatedData(options);
              } else {
                resolve(results.getCacheData);
              }
            },
          ],
          setCacheData: [
            "checkCacheData",
            function (results, cb) {
              debug("setCacheData");
              var cacheableResult = results.checkCacheData;
              self.cache.set(
                options.contentIndex,
                cacheableResult,
                self.cacheInterval,
                cb(null, cacheableResult)
              );
            },
          ],
        },
        function (err, result) {
          if (err) {
            debug("err:", err);
          }
          Bun.write("/tmp/bun_out", JSON.stringify(result.setCacheData));
          resolve(result.setCacheData);
        }
      );
    });
  }
}

export default PagerDuty;