"use client";

import React from "react";
import Datepicker from "tailwind-datepicker-react";

const options = {
  title: "Date",
  autoHide: true,
  todayBtn: true,
  clearBtn: true,
  // clearBtnText: "Clear",
  maxDate: new Date(),
  minDate: new Date("1950-01-01"),
  datepickerClassNames: "top-12",
  defaultDate: null,
  language: "en",
  inputNameProp: "date",
  inputIdProp: "date",
  inputPlaceholderProp: "Select Date",
  // inputDateFormatProp: {
  //   day: "numeric",
  //   month: "long",
  //   year: "numeric",
  // },
};

export const DatePicker = ({
  handleChange,
}: {
  handleChange: (date: Date) => void;
}) => {
  const [show, setShow] = React.useState<boolean>(false);

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
