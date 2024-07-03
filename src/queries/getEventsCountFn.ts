import { defaultEvents } from "@/utils/defaultEvents";
import { getEventsCount } from "@/utils/BigQuery/getEventsCount";

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
  const [_, projectId, datasetId, startTableName, endTableName] = queryKey;

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
        count: idk[event_name] || 0,
      },
    ]),
  );

  return result;
}
