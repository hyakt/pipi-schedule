import { Request, Response } from "express";
import { calendar_v3, google } from "googleapis";
import dayjs from "dayjs";
import groupBy from "lodash.groupby";

import { oauth2Client, setToken } from "~/utils/oauth";
import * as d from "~/utils/date";
import { sendMessage } from "~/utils/line";

const cosmeEvent = (event: calendar_v3.Schema$Event): string => {
  if (!event.start?.dateTime || !event.end?.dateTime)
    return `終日 - ${event.summary}`;
  const start = dayjs(event.start?.dateTime);
  const end = dayjs(event.end?.dateTime);
  return `${start.format("HH:mm")}から${end.format("HH:mm")}に${event.summary}`;
};

const todaySchedule = async (
  calendar: calendar_v3.Calendar
): Promise<string> => {
  try {
    const { data } = await calendar.events.list({
      calendarId: "primary",
      orderBy: "startTime",
      singleEvents: true,
      timeMin: d.today.toISOString(),
      timeMax: d.tomorrow.toISOString(),
    });

    if (data.items && data.items.length) {
      return [
        `今日(${d.today.format("MM月DD日(ddd)")})の予定`,
        "----------",
        ...data.items.map(cosmeEvent),
        "の予定です💁🏼‍♂️",
      ].join("\n");
    }

    return "今日の予定はありません😋";
  } catch (err) {
    throw err;
  }
};

const weeklySchedule = async (
  calendar: calendar_v3.Calendar
): Promise<string> => {
  try {
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
          ...v.map((e) => `${e.time ? e.time + "から" : ""}${e.summary}`),
        ])
        .flat();

      return [
        `今週(${d.today.format("MM月DD日")}~${d.nextWeek.format(
          "MM月DD日"
        )})の予定`,
        "----------",
        ...weeklySchedule,
        "の予定です🤞",
      ].join("\n");
    }

    return "今週の予定はありません😂";
  } catch (err) {
    throw err;
  }
};

export const pipiSchedule = async (req: Request, res: Response) => {
  try {
    await setToken().catch(() => {
      res.status(500);
      res.send("please auhorize first");
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const { when } = req.query;
    try {
      let schedule: string;
      switch (when) {
        case "nextWeek":
          schedule = await weeklySchedule(calendar);
          break;
        default:
          schedule = await todaySchedule(calendar);
      }
      sendMessage(schedule);
      res.send("ok");
    } catch (e) {
      await sendMessage("エラーで予定が取得できませんでした😭");
      await sendMessage(e);
      res.status(500);
      res.send(e.toString());
    }
  } catch (err) {
    res.status(500);
    res.send("An error occured");
  }
};
