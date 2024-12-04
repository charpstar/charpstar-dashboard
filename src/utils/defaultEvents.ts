export const defaultEvents = {
  charpstAR_Load: {
    title: "Total Page Views",
    tooltip: "Total Views on CharpstAR service enabled PDPs",
    count: undefined,
  },
  total_unique_users: {
    title: "Total Unique Users",
    tooltip: "Total Users on CharpstAR service enabled PDPs",
    count: undefined,
  },
  total_activated_users: {
    title: "Total Users who activate our services",
    tooltip: "Total Users on PDPs who click either of the AR/3D buttons",
    count: undefined,
  },
  percentage_charpstAR: {
    title: "Percentage of users using our service",
    tooltip: "The percentage of users who have visited a page with our script and have clicked either the AR or 3D Button",
    count: undefined,
  },
  overall_conv_rate: {
    title: "Conversion rate without AR/3D on PDP",
    tooltip: "The average conversion rate of users who do not use our services",
    count: undefined,
  },
  overall_conv_rate_CharpstAR: {
    title: "Conversion rate with CharpstAR",
    tooltip: "The average conversion rate of users when using either of our services",
    count: undefined,
  },
  total_purchases_after_ar: {
    title: "Total Purchases with CharpstAR",
    tooltip: "Total Purchases made after interacting with our services",
    count: undefined,
  },
  average_pages_after_ar: {
    title: "Average Page visits after AR/3D",
    tooltip: "The average amounnt of pages visited by a user after they activate our services",
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
  session_time_default: {
    title: "Session time duration without using AR/3D",
    tooltip: "The average session time of users on CharpstAR service enabled PDPs",
    count: undefined,
  },
  combined_session_time: {
    title: "Session time duration with CharpstAR",
    tooltip: "The average session time of users who have visited a page with our services and clicked either the AR or 3D Button",
    count: undefined,
  },
  cart_percentage_default: {
    title: "Add to Cart Default",
    tooltip: "The percentage of users adding a product to cart when they have not interacted with CharpstAR services" ,
    count: undefined,
  },
  cart_after_ar_percentage: {
    title: "Add to Cart with CharpstAR",
    tooltip: "The percentage of users adding a product to cart after they have interacted with either of the AR/3D buttons",
    count: undefined,
  },
  average_order_value_all_users: {
    title: "Average Order Value Default (Store currency)",
    tooltip: "The Average value in the store's default currency of orders made by customers when they have not interacted with CharpstAR services" ,
    count: undefined,
  },
  average_order_value_ar_users: {
    title: "Average Order Value with CharpstAR (Store currency)",
    tooltip: "The Average value in the store's default currency of orders made by customers after they have interacted with either of the AR/3D buttons",
    count: undefined,
  },
} as Record<
  string,
  { title: string; tooltip: string; count: number | undefined }
>;