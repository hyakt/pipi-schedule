import dayjs from "dayjs";
import "dayjs/locale/ja";

const d = dayjs().locale("ja");

export const today = d.hour(0).minute(0).second(0).millisecond(0);
export const tomorrow = today.add(1, "day");
export const nextWeek = today.add(1, "week");
