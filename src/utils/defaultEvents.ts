export const defaultEvents = {
  charpstAR_Load: {
    title: "Total Page Views",
    tooltip: "Total Views on CharpstAR service enabled PDPs",
  },
  total_unique_users: {
    title: "Total Unique Users",
    tooltip: "Total Unique Users on CharpstAR service enabled PDPs",
  },
  overall_conv_rate: {
    title: "Overall Conversion Rate",
    tooltip: `The conversion rate of all users who visited CharpstAR-enabled pages<br/><br/>
      <strong>Formula:</strong><br/>
      (Total Purchases on CharpstAR pages / Total Unique Users on CharpstAR pages) × 100`,
  },
  overall_conv_rate_CharpstAR: {
    title: "Conversion Rate (CharpstAR Activated)",
    tooltip: `The conversion rate of users who actively clicked AR or 3D buttons<br/><br/>
      <strong>Formula:</strong><br/>
      (Total Purchases by CharpstAR Activated Users / Total Users who clicked AR or 3D) × 100`,
  },
  cart_percentage_default: {
    title: "Overall Add to Cart Rate",
    tooltip: `The percentage of users adding products to cart on CharpstAR-enabled pages<br/><br/>
      <strong>Formula:</strong><br/>
      (Cart Additions on CharpstAR pages / Total Unique Users on CharpstAR pages) × 100`,
  },
  cart_after_ar_percentage: {
    title: "Add to Cart Rate (CharpstAR Activated)",
    tooltip: `The percentage of users adding products to cart after clicking AR or 3D buttons<br/><br/>
      <strong>Formula:</strong><br/>
      (Cart Additions by CharpstAR Activated Users / Total Users who clicked AR or 3D) × 100`,
  },
  percentage_charpstAR: {
    title: "CharpstAR Activation Rate",
    tooltip: `The percentage of CharpstAR page visitors who actively clicked AR or 3D buttons<br/><br/>
      <strong>Formula:</strong><br/>
      (Total Users who clicked AR or 3D / Total Unique Users on CharpstAR pages) × 100`,
  },
  total_activated_users: {
    title: "Total CharpstAR Activated Users",
    tooltip: "Total Users on CharpstAR-enabled pages who clicked either AR or 3D buttons",
  },
  total_purchases_after_ar: {
    title: "Total Purchases (CharpstAR Activated)",
    tooltip: "Total Purchases made by users who clicked AR or 3D buttons",
  },
  average_pages_after_ar: {
    title: "Average Page Visits (CharpstAR Activated)",
    tooltip: "The average number of pages visited by users after they click AR or 3D buttons",
  },
  charpstAR_AR_Button_Click: {
    title: "Total AR Clicks",
    tooltip: "Total clicks by users on the 'View in AR' Button on CharpstAR-enabled pages",
  },
  charpstAR_3D_Button_Click: {
    title: "Total 3D Clicks",
    tooltip: "Total clicks by users on the 'View in 3D' Button on CharpstAR-enabled pages",
  },
  session_time_default: {
    title: "Overall Average Session Time",
    tooltip: "The average session duration of all users on CharpstAR-enabled pages",
  },
  combined_session_time: {
    title: "Average Session Time (CharpstAR Activated)",
    tooltip: "The average session duration of users who clicked AR or 3D buttons",
  },
  average_order_value_all_users: {
    title: "Overall Average Order Value",
    tooltip: "The average order value of purchases made by all users on CharpstAR-enabled pages",
  },
  average_order_value_ar_users: {
    title: "Average Order Value (CharpstAR Activated)",
    tooltip: "The average order value of purchases made by users who clicked AR or 3D buttons",
  },
} as const;

export type EventName = keyof typeof defaultEvents;
export type EventMetadata = typeof defaultEvents[EventName];
export type EventsData = Partial<Record<EventName, number>>;