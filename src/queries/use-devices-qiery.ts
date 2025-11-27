import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/lib/http";
import { Device } from "@/db/schema/device";

async function fetchDevices(): Promise<Device[]> {
  const response = await httpGet<Device[]>("/devices");
  return response.data;
}

export function useDevicesQuery() {
  return useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: fetchDevices,
    staleTime: 60 * 1000,
    retry: false
  });
};