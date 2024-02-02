import { type BotConfig } from "@types";
import { type OncallSlackUser } from "@api/slack";
import jsonConfig from "config";

const config: BotConfig = jsonConfig as BotConfig;
type OncallMap = Record<string, string>;
export const oncallMap: OncallMap = config.pagerduty.oncall_map;

const transformMapping = (mapping: OncallMap): Record<string, string[]> => {
  // Given the regular oncall mapping, transform it into a
  // mapping of schedule id to a list of shortnames.
  const transformed: Record<string, string[]> = {};

  for (const name in mapping) {
    const id = mapping[name];
    if (transformed[id] !== undefined) {
      transformed[id].push(name);
    } else {
      transformed[id] = [name];
    }
  }

  return transformed;
};

export const makeOncallMappingMessage = (
  oncallSlackMembers: OncallSlackUser[]
): any => {
  const shortnamesMap = transformMapping(oncallMap);
  return (
    Object.entries(shortnamesMap)
      .map(([pdScheduleId, shortnames]) => [
        shortnames,
        oncallSlackMembers.find((s) => s.pdScheduleId === pdScheduleId),
      ])
      // remove null and undefined
      .filter(([_, id]: Array<string[] | OncallSlackUser | undefined>) => id !== null || id !== undefined)
      .map(
        ([shortnames, s]: Array<string[] | OncallSlackUser | undefined>) =>
          `(${(shortnames as string[]).join(" | ")}): @${
            (s as OncallSlackUser).name
          }`
      )
      .join("\n")
  );
};
