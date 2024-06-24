import dayjs from "@/utils/dayjs";

export function dayjsToComp(date: dayjs.Dayjs) {
  return date.format("YYYY-MM-DD");
}

export function compToBq(date: string) {
  return date.replace(/-/g, "");
}

export function buildDateRange(
  startDate: dayjs.Dayjs = dayjs().subtract(7, "days"),
  endDate: dayjs.Dayjs = dayjs(),
) {
  return {
    startDate: dayjsToComp(startDate),
    endDate: dayjsToComp(endDate),
  };
}
