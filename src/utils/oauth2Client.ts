import { google } from "googleapis";

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = process.env;

export const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
