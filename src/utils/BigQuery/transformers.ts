import type { BigQueryResponse, ProductMetrics } from "./types";
import type { EventsData } from "@/utils/defaultEvents";

export function transformProductMetrics(productMetrics: BigQueryResponse[]): ProductMetrics[] {
  return productMetrics.map(item => {
    const metrics = JSON.parse(item.metrics);
    return {
      product_name: item.metric_name,
      AR_Button_Clicks: parseInt(metrics.AR_Button_Clicks),
      _3D_Button_Clicks: parseInt(metrics._3D_Button_Clicks),
      total_button_clicks: parseInt(metrics.total_button_clicks),
      total_purchases: parseInt(metrics.total_purchases),
      purchases_with_service: parseInt(metrics.purchases_with_service),
      product_conv_rate: parseFloat(metrics.product_conv_rate),
      default_conv_rate: parseFloat(metrics.default_conv_rate),
      total_views: parseInt(metrics.total_views),
      avg_session_duration_seconds: parseFloat(metrics.avg_session_duration_seconds),
      avg_combined_session_duration: parseFloat(metrics.avg_combined_session_duration)
    };
  });
}

export function transformOverallMetrics(overallMetrics: BigQueryResponse[]): EventsData {
  return Object.fromEntries(
    overallMetrics.map(item => [
      item.metric_name,
      parseFloat(JSON.parse(item.metrics).value)
    ])
  ) as EventsData;
}