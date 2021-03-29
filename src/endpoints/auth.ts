import { Request, Response } from "express";
import { oauth2Client } from "~/utils/oauth";

const scopes = ["https://www.googleapis.com/auth/calendar"];

export const auth = (_: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.send(url);
};
