import { Request, Response } from "express";
import { calendar_v3, google } from "googleapis";
import fetch from "node-fetch";
import FormData from "form-data";
import dayjs from "dayjs";

import { oauth2Client } from "~/utils/oauth2Client";
import { downloadToken } from "~/utils/storage";
import * as d from "~/utils/date";

const { LINE_NOTIFY_TOKEN } = process.env;

const authorize = async () => {
  try {
    const tokenBuffer = await downloadToken();
    const token = JSON.parse(tokenBuffer.toString());
    oauth2Client.setCredentials(token);
  } catch (err) {
    throw err;
  }
};

const cosmeEvent = (event: calendar_v3.Schema$Event): string => {
  if (!event.start?.dateTime || !event.end?.dateTime)
    return `終日 ${event.summary}`;
  const start = dayjs(event.start?.dateTime);
  const end = dayjs(event.end?.dateTime);
  return `${start.format("HH:mm")}~${end.format("HH:mm")} - ${event.summary}`;
};

const todaySchedule = async (
  calendar: calendar_v3.Calendar
): Promise<string[]> => {
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
        `今日(${d.today.format("MM月dd日(ddd)")})の予定`,
        ...data.items.map(cosmeEvent),
      ];
    }

    return ["今日の予定はありません"];
  } catch (err) {
    throw err;
  }
};

const weeklySchedule = async (
  calendar: calendar_v3.Calendar
): Promise<string[]> => {
  try {
    const { data } = await calendar.events.list({
      calendarId: "primary",
      orderBy: "startTime",
      singleEvents: true,
      timeMin: d.today.toISOString(),
      timeMax: d.nextWeek.toISOString(),
    });

    if (data.items && data.items.length) {
      return [
        `今週(${d.today.format("MM月dd日")}~${d.nextWeek.format(
          "MM月dd日"
        )})の予定`,
        ...data.items.map(cosmeEvent),
      ];
    }

    return ["今週の予定はありません"];
  } catch (err) {
    throw err;
  }
};

const sendMessage = async (message: string): Promise<void> => {
  const params = new FormData();
  params.append("message", `${message}`);
  try {
    await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
      },
      body: params,
    });
  } catch (e) {
    throw e;
  }
};

export const pipiSchedule = async (_req: Request, res: Response) => {
  try {
    await authorize().catch(() => {
      res.status(500);
      res.send("please auhorize first");
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
      let schedule: string[];
      schedule = await todaySchedule(calendar);
      schedule.map(sendMessage);
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
