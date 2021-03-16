import { Request, Response } from "express";
import { google } from "googleapis";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

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
