import fetch from "node-fetch";
import FormData from "form-data";

const { LINE_NOTIFY_TOKEN } = process.env;

export const sendMessage = async (message: string): Promise<void> => {
  const params = new FormData();
  params.append("message", `${message}`);
  try {
    await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
      },
      body: params,
    });
  } catch (e) {
    throw e;
  }
};
