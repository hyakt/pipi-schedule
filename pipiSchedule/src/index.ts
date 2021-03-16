import fs from "fs";
import { Request, Response } from "express";
import { google } from "googleapis";
import fetch from "node-fetch";
import FormData from "form-data";

const fsPromises = fs.promises;

const {
  LINE_NOTIFY_TOKEN,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL,
} = process.env;

const TOKEN_PATH = "token.json";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const authorize = async () => {
  try {
    const token = await fsPromises.readFile(TOKEN_PATH, "utf-8");
    oauth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return Promise.reject("Can not read file.");
  }
};

export const pipiSchedule = async (req: Request, res: Response) => {
  try {
    await authorize().catch(() => {
      res.status(500);
      res.send("please auhorize first");
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const result = await calendar.calendarList.get({ calendarId: "primary" });
    // calendar.events.list(
    //   {
    //     calendarId: "primary",
    //   },
    //   (err, res) => {
    //     if (err || !res) return console.log("The API returned an error: " + err);
    //     const events = res.data.items;
    //     console.log("events: ", events);
    //     if (events && events.length) {
    //       console.log("Upcoming 10 events:");

    //       events.map((event, i) => {
    //         const start = event.start?.dateTime || event.start?.date;
    //         console.log(`${start} - ${event.summary}`);
    //         const params = new FormData();
    //         params.append("message", `${start} - ${event.summary}`);

    //         fetch("https://notify-api.line.me/api/notify", {
    //           method: "POST", // or 'PUT'
    //           headers: {
    //             Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
    //           },
    //           body: params,
    //         })
    //           .then((response) => response.json())
    //           .then((data) => {
    //             console.log("Success:", data);
    //           })
    //           .catch((error) => {
    //             console.error("Error:", error);
    //           });
    //       });
    //     } else {
    //       console.log("No upcoming events found.");
    //     }
    //   }

    // );
    res.send(result);
  } catch (err) {
    res.status(500);
    res.send("An error occured");
  }
};
