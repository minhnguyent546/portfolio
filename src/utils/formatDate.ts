import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import config from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

export type DatePrecision = "day" | "day-short" | "month";

/**
 * `day-short` drops the year from the label alone: the blog ledger prints the
 * year once in the group heading, but each row still needs the full date in
 * its `datetime` attribute.
 */
const FORMATS: Record<DatePrecision, { label: string; datetime: string }> = {
  day: { label: "D MMMM YYYY", datetime: "YYYY-MM-DD" },
  "day-short": { label: "D MMM", datetime: "YYYY-MM-DD" },
  month: { label: "MMMM YYYY", datetime: "YYYY-MM" },
};

/**
 * A YAML date always materialises a day. `precision: "month"` keeps that day
 * out of both the label and the `datetime` attribute, so a month-only entry
 * never prints a day nobody recorded.
 */
export function formatDate(date: Date, precision: DatePrecision = "day") {
  const d = dayjs(date).tz(config.site.timezone);
  const format = FORMATS[precision];
  return {
    label: d.format(format.label),
    datetime: d.format(format.datetime),
  };
}
