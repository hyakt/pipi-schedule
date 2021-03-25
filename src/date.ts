import dayjs from "dayjs";

const d = dayjs().locale("jp");

export const today = d.hour(0).minute(0).second(0).millisecond(0);
export const tomorrow = today.add(1, "day");
export const nextWeek = today.add(1, "week");
