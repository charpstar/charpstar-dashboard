"use client";

import React from "react";
import Datepicker from "tailwind-datepicker-react";

const options = {
  title: "Demo Title",
  autoHide: true,
  todayBtn: false,
  clearBtn: true,
  // clearBtnText: "Clear",
  maxDate: new Date("2030-01-01"),
  minDate: new Date("1950-01-01"),
  datepickerClassNames: "top-12",
  defaultDate: new Date("2022-01-01"),
  language: "en",
  disabledDates: [],
  weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  inputNameProp: "date",
  inputIdProp: "date",
  inputPlaceholderProp: "Select Date",
  // inputDateFormatProp: {
  //   day: "numeric",
  //   month: "long",
  //   year: "numeric",
  // },
};

export const DemoComponent = () => {
  const [show, setShow] = React.useState<boolean>(false);

  const handleChange = (selectedDate: Date) => {
    console.log(selectedDate);
  };

  const handleClose = (state: boolean) => {
    setShow(state);
  };

  return (
    <div>
      <Datepicker
        options={options}
        onChange={handleChange}
        show={show}
        setShow={handleClose}
      />
    </div>
  );
};
