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
    title: "Conversion rate without AR/3D activation",
    tooltip: `The average conversion rate of users who do not use our services<br/><br/>
      <strong>Formula:</strong><br/>
      (Total Purchases on entire store / Total Unique Users on entire store) × 100`,
  },
  overall_conv_rate_CharpstAR: {
    title: "Conversion rate with AR/3D activation",
    tooltip: `The average conversion rate of users when using either of our services<br/><br/>
      <strong>Formula:</strong><br/>
      (Total Purchases with AR/3D / Total Unique Users with AR/3D uses) × 100`,
  },
  cart_percentage_default: {
    title: "Add to Cart Default",
    tooltip: `The percentage of users adding a product to cart when they have not interacted with CharpstAR services<br/><br/>
      <strong>Formula:</strong><br/>
      (Cart Additions on entire store  / Total Unique Users on entire store) × 100`,
  },
  cart_after_ar_percentage: {
    title: "Add to Cart with CharpstAR",
    tooltip: `The percentage of users adding a product to cart after they have interacted with either of the AR/3D buttons<br/><br/>
      <strong>Formula:</strong><br/>
      (Cart Additions with AR/3D / Total Unique Users with AR/3D) × 100`,
  },
  percentage_charpstAR: {
    title: "Percentage of users using our service",
    tooltip: `The percentage of users who have visited a page with our script and have clicked either the AR or 3D Button<br/><br/>
      <strong>Formula:</strong><br/>
      (Total Unique Users with AR/3D uses / Total Unique Users on entire store) × 100`,
  },
  total_activated_users: {
    title: "Total Users who activate our services",
    tooltip: "Total Users on PDPs who click either of the AR/3D buttons",
  },
  total_purchases_after_ar: {
    title: "Total Purchases with AR/3D activation",
    tooltip: "Total Purchases made after interacting with our services",
  },
  average_pages_after_ar: {
    title: "Average Page visits after AR/3D activation",
    tooltip: "The average amount of pages visited by a user after they activate our services",
  },
  charpstAR_AR_Button_Click: {
    title: "Total AR Clicks",
    tooltip: "Total clicks by users on the 'View in AR' Button",
  },
  charpstAR_3D_Button_Click: {
    title: "Total 3D Clicks",
    tooltip: "Total clicks by users on the 'View in 3D' Button",
  },
  session_time_default: {
    title: "Session time duration without AR/3D activation",
    tooltip: "The average session time of users on CharpstAR service enabled PDPs when they have not interacted with our services",
  },
  combined_session_time: {
    title: "Session time duration with AR/3D activation",
    tooltip: "The average session time of users who have visited a page with our services and clicked either the AR or 3D Button",
  },
  average_order_value_all_users: {
    title: "Average Order Value without AR/3D activation (Store currency)",
    tooltip: "The Average value in the store's default currency of orders made by customers when they have not interacted with CharpstAR services",
  },
  average_order_value_ar_users: {
    title: "Average Order Value with AR/3D activation (Store currency)",
    tooltip: "The Average value in the store's default currency of orders made by customers after they have interacted with either of the AR/3D buttons",
  },
} as const;

export type EventName = keyof typeof defaultEvents;
export type EventMetadata = typeof defaultEvents[EventName];
export type EventsData = Partial<Record<EventName, number>>;
