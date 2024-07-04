export const defaultEvents = {
  charpstAR_Load: {
    title: "Total Page Views",
    tooltip: "Total page views on pages with our service",
    count: undefined,
  },
  charpstAR_AR_Button_Click: {
    title: "Total AR Clicks",
    tooltip: "Total clicks by users on the 'View in AR' Button",
    count: undefined,
  },
  charpstAR_3D_Button_Click: {
    title: "Total 3D Clicks",
    tooltip: "Total clicks by users on the 'View in 3D' Button",
    count: undefined,
  },
  percentage_charpstAR: {
    title: "Percentage of users using our service",
    tooltip: "The percentage of users who have visited a page with our script and have clicked either the AR or 3D Button",
    count: undefined,
  },
  overall_conv_rate: {
    title: "Conversion Rate Default",
    tooltip: "The average conversion rate of users who do not use our services",
    count: undefined,
  },
  overall_conv_rate_CharpstAR: {
    title: "Conversion Rate - CharpstAR",
    tooltip: "The average conversion rate of users when using either of our services",
    count: undefined,
  },
  session_time_default: {
    title: "Session Time Average",
    tooltip: "The store average session time",
    count: undefined,
  },
  combined_session_time: {
    title: "Session Time Average - CharpstAR",
    tooltip: "The average session time of users who have visited a page with our services and clicked either the AR or 3D Button",
    count: undefined,
  },
} as Record<
  string,
  { title: string; tooltip: string; count: number | undefined }
>;