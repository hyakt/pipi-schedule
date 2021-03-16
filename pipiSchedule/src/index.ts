import { Request, Response } from "express";
import { google } from "googleapis";
import fetch from "node-fetch";
import FormData from "form-data";

const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL =
  "https://us-central1-model-fastness-307516.cloudfunctions.net/pipiSchedule";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const callback = async (code: string) => {
  console.log("code", code);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
};

export const pipiSchedule = async (req: Request, res: Response) => {
  if (req.query.code) {
    try {
      await callback(req.query.code as string);
    } catch (err) {
      console.error("cant set credentials");
      console.error("err", err);
      return;
    }
  }

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
};
