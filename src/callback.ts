import { Request, Response } from "express";
import { oauth2Client } from "./oauth2Client";

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
