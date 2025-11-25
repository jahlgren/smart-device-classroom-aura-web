import { useDevicesQuery } from "@/queries/use-devices-qiery"
import { Spinner } from "../ui/spinner";
import { Device } from "@/db/schema/device";
import { 
  MoreVertical,
  Trash,
  Edit2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useDeviceDeleteMutation } from "@/mutations/use-delete-device-mutation";
import { useReadingsQuery } from "@/queries/use-readings-query";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts";
import { Reading } from "@/db/schema/reading";
import { useMemo } from "react";

export default function DevicesBlock() {

  const {data, isPending} = useDevicesQuery();

  if(isPending)
    return <Loading />

  if(!data || data.length === 0) 
    return (<div className="text-muted-foreground">No devices found</div>)

  return (
    <DeviceList>
      {data?.map(d => <DeviceItem device={d} key={d.id} />)}
    </DeviceList>
  )
}

function Loading() {
  return (
    <div className="flex items-center gap-4">
      <Spinner /><span>Loading devices</span>
    </div>
  );
}

function DeviceList({children}: any) {
  return (
    <ul className="flex flex-col gap-4">
      {children}
    </ul>
  );
}

function DeviceItem({device}: {device: Device}) {

  const {data: readings, isPending: isPendingReadings} = useReadingsQuery(device.id);
  const {mutate: deleteDevice, isPending: isPendingDeletion } = useDeviceDeleteMutation();

  const airQualityReadings = (!readings || readings.length == 0) ? [] : (
    readings.filter(p => p.readingType === "airQuality")
  );

  const currentAirQualityReading = airQualityReadings[airQualityReadings.length-1];

  const handleRemove = () => {
    deleteDevice({id: device.id});
  }

  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-muted-foreground">ID:</span>
          <p className="font-mono font-bold tracking-wider text-slate-800">{device.id}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2" isPending={isPendingDeletion}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={true}>
              <Edit2 />
              Update
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRemove()}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      { device.description ? (
        <div className="flex flex-col">
          <span className="text-muted-foreground w-24 text-sm">Description</span>
          <p>{device.description}</p>
        </div>
      ) : undefined }

      <div className="flex flex-col">
        <p className="text-muted-foreground text-sm">Readings <span className="italic">(last reading at {new Date(currentAirQualityReading.createdAt).toLocaleDateString()} {new Date(currentAirQualityReading.createdAt).toLocaleTimeString()})</span></p>
        
        { isPendingReadings ? <div><Spinner /> Loading readings</div> : (
          (!readings || readings.length == 0) ? "No readings found" : (
            <div className="space-y-4">
              <p>
                Air Quality: {currentAirQualityReading.value}
              </p>
              <ReadingsChart readings={airQualityReadings} />
            </div>
          )
        ) }
      </div>
    </li>
  )
}


const chartConfig = {
  airQuality: {
    label: "Air Quality",
    color: "var(--foreground)",
  }
} satisfies ChartConfig

const bands = [
  { from: 0,   to: 50,  color: "#00c853" },
  { from: 50,  to: 100, color: "#64dd17" },
  { from: 100, to: 200, color: "#fdd835" },
  { from: 200, to: 300, color: "#ffb300" }, 
  { from: 300, to: 400, color: "#fb8c00" },
  { from: 400, to: 500, color: "#d50000" },
];

function ReadingsChart({readings}: {readings: Reading[]}) {

  const data = useMemo(() => {
    return readings.map(v => ({
      date: new Date(v.createdAt).getTime(),
      airQuality: Math.max(0, Math.min(500, v.value)),
    }));
  }, [readings]);
  
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] w-full"
    >
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12
        }}
      >
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString();
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={30}
          domain={[0, 500]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[150px]"
              nameKey="airQuality"
              labelFormatter={(_, payload) => {
                if (!payload?.[0]) return "";

                const timestamp = payload[0].payload.date;

                return new Date(timestamp).toLocaleDateString("en-SE", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }}
            />
          }
        />
        {bands.map((band, i) => (
          <ReferenceArea
            key={band.from+"-"+band.to}
            y1={band.from}
            y2={band.to}
            fill={band.color}
            fillOpacity={0.25}
            ifOverflow="extendDomain"
          />
        ))}
        <Line
          dataKey={"airQuality"}
          type="monotone"
          stroke={`var(--color-${"airQuality"})`}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
