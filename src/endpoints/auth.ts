import { Request, Response } from "express";
import { oauth2Client } from "~/utils/oauth2Client";

const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];

export const auth = (_: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.send(url);
};

export const callback = async (req: Request, res: Response) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code as string);
    res.send(tokens);
  } catch (err) {
    res.status(500);
    console.error(err);
    res.send("Can not get credentials.");
  }
};
