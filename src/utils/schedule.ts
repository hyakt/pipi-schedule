import { calendar_v3 } from "googleapis";
import dayjs from "dayjs";
import groupBy from "lodash.groupby";

import * as d from "~/utils/date";

const cosmeEvent = (event: calendar_v3.Schema$Event): string => {
  if (!event.start?.dateTime || !event.end?.dateTime)
    return `終日 - ${event.summary}`;
  const start = dayjs(event.start?.dateTime);
  const end = dayjs(event.end?.dateTime);
  return `${start.format("HH:mm")}から${end.format("HH:mm")} - ${
    event.summary
  }`;
};

export const today = async (
  calendar: calendar_v3.Calendar
): Promise<string | undefined> => {
  const { data } = await calendar.events.list({
    calendarId: "primary",
    orderBy: "startTime",
    singleEvents: true,
    timeMin: d.today.toISOString(),
    timeMax: d.tomorrow.toISOString(),
  });

  if (data.items && data.items.length) {
    return data.items.map(cosmeEvent).join("n");
  }
};

export const weekly = async (
  calendar: calendar_v3.Calendar
): Promise<string | undefined> => {
  const { data } = await calendar.events.list({
    calendarId: "primary",
    orderBy: "startTime",
    singleEvents: true,
    timeMin: d.today.toISOString(),
    timeMax: d.nextWeek.toISOString(),
  });

  if (data.items && data.items.length) {
    const schedule = data.items.map((s) => ({
      date: dayjs(s.start?.date || s.start?.dateTime || undefined)
        .locale("ja")
        .format("MM月DD日(ddd)"),
      time: s.start?.dateTime
        ? dayjs(s.start.dateTime).format("HH:mm")
        : undefined,
      summary: s.summary,
    }));

    const weeklySchedule = Object.entries(groupBy(schedule, "date"))
      .map(([k, v]) => [
        k,
        ...v.map((e) => ` ${e.time ? e.time + "から" : ""}${e.summary}`),
      ])
      .flat();

    return weeklySchedule.join("\n");
  }
};
