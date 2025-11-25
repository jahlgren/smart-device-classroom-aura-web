import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/lib/http";
import { Reading } from "@/db/schema/reading";

async function fetchReadings(deviceId: string): Promise<Reading[]> {
  const response = await httpGet<Reading[]>("/devices/" + deviceId + "/readings");
  return response.data;
}

export function useReadingsQuery(deviceId: string) {
  return useQuery<Reading[]>({
    queryKey: ["devices", deviceId],
    queryFn: () => fetchReadings(deviceId),
    staleTime: 20 * 1000,
    retry: false,
    refetchInterval: 30 * 1000
  });
};