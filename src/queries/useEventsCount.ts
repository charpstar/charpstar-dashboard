"use server";

import { getBigQueryClient } from "@/utils/BigQuery/client";
import { type EventsData, type EventName, defaultEvents } from "@/utils/defaultEvents";

export async function getEventsCount({
  projectId,
  datasetId,
  startTableName,
  endTableName,
}: {
  projectId: string;
  datasetId: string;
  startTableName: string;
  endTableName: string;
}): Promise<Record<EventName, number>> {
  const bigqueryClient = getBigQueryClient({ projectId });
  const query = `/* Your existing query */`;

  const options = {
    query: query,
    projectId,
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const response = await job.getQueryResults();

  const result = response[0] as unknown as {
    event_name: EventName;
    count: number;
  }[];

  // Create a map of event counts with default values
  const eventCounts: Partial<Record<EventName, number>> = {};
  
  // Initialize all events with 0
  Object.keys(defaultEvents).forEach((key) => {
    eventCounts[key as EventName] = 0;
  });

  // Update with actual values from query
  result.forEach(({ event_name, count }) => {
    eventCounts[event_name] = count;
  });

  return eventCounts as Record<EventName, number>;
}

export function useEventsCount({
  startTableName,
  endTableName,
}: {
  startTableName: string;
  endTableName: string;
}) {
  const user = useUser();
  const { projectId, datasetId } = user.metadata;

  const shouldEnableFetching = Boolean(user && startTableName && endTableName);

  const { data: eventsCount = defaultEvents, isLoading: isEventsCountLoading } = useQuery({
    queryKey: [
      "eventsCount",
      projectId,
      datasetId,
      startTableName,
      endTableName,
    ],
    queryFn: getEventsCountFn,
    enabled: shouldEnableFetching,
  });

  return { eventsCount, isEventsCountLoading };
}

export async function getEventsCountFn({
  queryKey,
}: {
  queryKey: [
    string,
    string,
    Parameters<typeof getEventsCount>[0]["datasetId"],
    string,
    string,
  ];
}) {
  const [, projectId, datasetId, startTableName, endTableName] = queryKey;

  const counts = await getEventsCount({
    projectId,
    datasetId,
    startTableName,
    endTableName,
  });

  // Transform the counts into the expected format
  const result: EventsData = {};
  
  Object.entries(defaultEvents).forEach(([eventName, metadata]) => {
    result[eventName as EventName] = counts[eventName as EventName] || 0;
  });

  return result;
}