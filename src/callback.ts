import { Request, Response } from "express";
import { oauth2Client } from "./oauth2Client";
import { saveToken } from "./storage";

export const callback = async (req: Request, res: Response) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code as string);
    try {
      await saveToken(JSON.stringify(tokens));
      res.send(tokens);
    } catch (e) {
      res.send(e);
    }
  } catch (err) {
    res.status(500);
    console.error(err);
    res.send("Can not get credentials.");
  }
};
