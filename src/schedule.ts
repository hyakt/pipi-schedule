import { Request, Response } from "express";
import { google } from "googleapis";
import fetch from "node-fetch";
import FormData from "form-data";

import { oauth2Client } from "./oauth2Client";
import { download } from "./storage";

const { LINE_NOTIFY_TOKEN } = process.env;

const authorize = async () => {
  try {
    const tokenBuffer = await download();
    const token = JSON.parse(tokenBuffer.toString());
    oauth2Client.setCredentials(token);
  } catch (err) {
    return Promise.reject("Can not read file.");
  }
};

const sendMessage = (message: string): void => {
  const params = new FormData();
  params.append("message", `${message}`);
  fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
    },
    body: params,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export const pipiSchedule = async (_req: Request, res: Response) => {
  try {
    await authorize().catch(() => {
      res.status(500);
      res.send("please auhorize first");
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
      const { data } = await calendar.events.list({
        calendarId: "primary",
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });
      const events = data.items;
      if (events && events.length) {
        const message = events.map((event) => event.summary).join(" ");
        sendMessage(message);
        res.send("ok");
      } else {
        res.send("No upcoming events found.");
      }
    } catch (e) {
      res.status(500);
      res.send(e);
    }
  } catch (err) {
    res.status(500);
    res.send("An error occured");
  }
};
