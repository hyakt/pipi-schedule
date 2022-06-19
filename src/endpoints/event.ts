import { Request, Response } from "express";
import { calendar_v3, google } from "googleapis";

import { oauth2Client, setToken } from "~/utils/oauth";
import { sendMessage } from "~/utils/line";
import { getTokyoWeather } from "~/utils/weather";
import {
  today as todaySchedule,
  weekly as weeklySchedule,
  add as addEvents,
} from "~/utils/schedule";
import * as d from "~/utils/date";

const todayEvents = async (calendar: calendar_v3.Calendar): Promise<string | undefined> => {
  const schedule = await todaySchedule(calendar);
  const weather = await getTokyoWeather();

  if (!schedule) return
  return [
    `${d.today.format("MM/DD(ddd)")}の予定 ${weather}`,
    "---------------",
    schedule,
  ].join("\n");
};

const weeklyEvents = async (
  calendar: calendar_v3.Calendar
): Promise<string> => {
  const schedule = await weeklySchedule(calendar);

  return [
    `今週(${d.today.format("MM/DD")}~${d.nextWeek.format("MM/DD")})の予定`,
    "---------------",
    schedule || "今週の予定はありません🚀",
  ].join("\n");
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
      let schedule: string | undefined;
      switch (when) {
        case "nextWeek":
          schedule = await weeklyEvents(calendar);
          break;
        default:
          schedule = await todayEvents(calendar);
      }
      if (!schedule) return
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

export const addSchedule = async (_req: Request, res: Response) => {
  await setToken().catch(() => {
    res.status(500);
    res.send("please auhorize first");
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    await addEvents(calendar);
    res.send("ok");
  } catch (err) {
    res.status(500);
    res.send(err);
  }
};
