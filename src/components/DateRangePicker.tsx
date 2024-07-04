import Datepicker, { type DateValueType } from "react-tailwindcss-datepicker";
import dayjs from "@/utils/dayjs";

import { customShortcuts } from "@/utils/uiUtils";

interface DateRangePickerProps {
  value: { startDate: string; endDate: string };
  minDate?: Date;
  onChange: (newValue: { startDate: string; endDate: string }) => void;
}

export default function DateRangePicker({
  value,
  minDate,
  onChange,
}: DateRangePickerProps) {
  const handleValueChange = (newValue: DateValueType) => {
    const { startDate: startDateStr, endDate: endDateStr } = newValue ?? {};

    if (
      startDateStr &&
      endDateStr &&
      typeof startDateStr === "string" &&
      typeof endDateStr === "string"
    ) {
      onChange(newValue as { startDate: string; endDate: string });
    }
  };

  return (
    <Datepicker
      value={value}
      onChange={handleValueChange}
      showShortcuts={true}
      maxDate={dayjs().add(-1, "day").toDate()}
      minDate={minDate}
      configs={{
        shortcuts: customShortcuts,
      }}
    />
  );
}
