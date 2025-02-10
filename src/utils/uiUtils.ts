import dayjs from "@/utils/dayjs";
import { type ShortcutsItem } from "react-tailwindcss-datepicker";

export function dayjsToComp(date: dayjs.Dayjs) {
  return date.format("YYYY-MM-DD");
}

export function compToBq(date: string) {
  return date.replace(/-/g, "");
}

export function buildDateRange(monitoredSince?: string) {
  const end = dayjs().add(-1, "day");
  const defaultStart = end.add(-45, "day"); 
  
  if (monitoredSince) {
    const monitoredSinceDate = dayjs(monitoredSince);
    // Check if we have at least 30 days of data
    if (end.diff(monitoredSinceDate, 'day') >= 45) {
      return {
        startDate: dayjsToComp(defaultStart),
        endDate: dayjsToComp(end),
      };
    }
    // If not, use the monitored since date
    return {
      startDate: dayjsToComp(monitoredSinceDate),
      endDate: dayjsToComp(end),
    };
  }

  return {
    startDate: dayjsToComp(defaultStart),
    endDate: dayjsToComp(end),
  };
}

export function isMonthlyView(startDate: string, endDate: string): boolean {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const daysDiff = end.diff(start, 'day');
  return daysDiff >= 28 && daysDiff <= 31;
}

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const customShortcutsDayJs: Record<
  string,
  Omit<ShortcutsItem, "period"> & {
    period: {
      start: dayjs.Dayjs;
      end: dayjs.Dayjs;
    };
  }
> = {
  yesterday: {
    text: "Yesterday",
    period: {
      start: dayjs().add(-1, "day"),
      end: dayjs().add(-1, "day"),
    },
  },
  last7days: {
    text: "Last 7 days",
    period: {
      start: dayjs().add(-7, "day"),
      end: dayjs().add(-1, "day"),
    },
  },
  last15days: {
    text: "Last 15 days",
    period: {
      start: dayjs().add(-15, "day"),
      end: dayjs().add(-1, "day"),
    },
  },
  last30days: {
    text: "Last 30 days",
    period: {
      start: dayjs().add(-30, "day"),
      end: dayjs().add(-1, "day"),
    },
  },
   last60days: {
      text: "Last 60 days",
      period: {
        start: dayjs().add(-60, "day"),
        end: dayjs().add(-1, "day"),
      },
  },
};

export const customShortcuts: Record<string, ShortcutsItem> =
  Object.fromEntries(
    Object.entries(customShortcutsDayJs).map(([key, value]) => [
      key,
      {
        text: value.text,
        period: {
          start: value.period.start.toDate(),
          end: value.period.end.toDate(),
        },
      },
    ]),
  );