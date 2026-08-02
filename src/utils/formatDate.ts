import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import config from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

export type DatePrecision = "day" | "month";

/**
 * A YAML date always materialises a day. `precision: "month"` keeps that day
 * out of both the label and the `datetime` attribute, so a month-only entry
 * never prints a day nobody recorded.
 */
export function formatDate(date: Date, precision: DatePrecision = "day") {
  const d = dayjs(date).tz(config.site.timezone);
  return {
    label: d.format(precision === "month" ? "MMMM YYYY" : "D MMMM YYYY"),
    datetime: d.format(precision === "month" ? "YYYY-MM" : "YYYY-MM-DD"),
  };
}
