import { google } from "googleapis";
import { downloadToken } from "./storage";

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = process.env;

export const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

export const setToken = async () => {
  try {
    const tokenBuffer = await downloadToken();
    const token = JSON.parse(tokenBuffer.toString());
    oauth2Client.setCredentials(token);
  } catch (err) {
    throw err;
  }
};
