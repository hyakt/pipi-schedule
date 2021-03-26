import fetch from "node-fetch";

export const getTokyoWeather = async () => {
  const fetched = await fetch(
    "https://weather.tsukumijima.net/api/forecast/city/130010"
  );
  const weather = await fetched.json();

  const telop = weather.forecasts[0].telop as string;
  const telopEmoji = telop
    .replace("晴", "☀️")
    .replace("曇", "☁️")
    .replace("雨", "☔️");
  return telopEmoji;
};
