import { useQuery } from "@tanstack/react-query";

import { getEventsCount } from "@/utils/BigQuery/getEventsCount";
import { useUser } from "@/contexts/UserContext";

import { defaultEvents } from "@/utils/defaultEvents";

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

  const { data: _eventsCount, isLoading: isEventsCountLoading } = useQuery({
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

  const eventsCount = _eventsCount ?? defaultEvents;

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

  const idk = await getEventsCount({
    projectId,
    datasetId,

    startTableName,
    endTableName,
  });

  const result: typeof defaultEvents = Object.fromEntries(
    Object.entries(defaultEvents).map(([event_name, data]) => [
      event_name,
      {
        ...data,
        count: idk[event_name] ?? 0,
      },
    ]),
  );

  return result;
}
