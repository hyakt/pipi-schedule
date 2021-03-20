import fs from "fs";
import { Request, Response } from "express";
import { google } from "googleapis";
import fetch from "node-fetch";
import FormData from "form-data";

import { oauth2Client } from "./oauth2Client";

const fsPromises = fs.promises;

const { LINE_NOTIFY_TOKEN } = process.env;

const TOKEN_PATH = "token.json";

const authorize = async () => {
  try {
    const token = await fsPromises.readFile(TOKEN_PATH, "utf-8");
    oauth2Client.setCredentials(JSON.parse(token));
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
