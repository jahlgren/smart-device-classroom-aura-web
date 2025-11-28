import { useDevicesQuery } from "@/queries/use-devices-qiery";
import { Spinner } from "../ui/spinner";
import { Device } from "@/db/schema/device";
import {
  MoreVertical,
  Trash,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useDeviceDeleteMutation } from "@/mutations/use-delete-device-mutation";
import { useReadingsQuery } from "@/queries/use-readings-query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts";
import { Reading } from "@/db/schema/reading";
import { useMemo } from "react";

export default function DevicesBlock() {
  const { data, isPending } = useDevicesQuery();

  if (isPending) return <Loading />;

  if (!data || data.length === 0)
    return <div className="text-muted-foreground">No devices found</div>;

  return (
    <DeviceList>
      {data?.map((d) => (
        <DeviceItem device={d} key={d.id} />
      ))}
    </DeviceList>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <span>Loading devices</span>
    </div>
  );
}

function DeviceList({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-4">{children}</ul>;
}

function DeviceItem({ device }: { device: Device }) {
  const { data: readings, isPending: isPendingReadings } = useReadingsQuery(
    device.id
  );
  const { mutate: deleteDevice, isPending: isPendingDeletion } =
    useDeviceDeleteMutation();

  const airQualityReadings =
    !readings || readings.length === 0
      ? []
      : readings.filter((p) => p.readingType === "airQuality");

  const currentAirQualityReading =
    airQualityReadings[airQualityReadings.length - 1];
    
  // const previousAirQualityReading =
  //   airQualityReadings[airQualityReadings.length - 2];

  // const trendDelta =
  //   currentAirQualityReading && previousAirQualityReading
  //     ? currentAirQualityReading.value - previousAirQualityReading.value
  //     : null;

  const trendDelta = getSmoothedTrend(readings || [], 5);

  const statusBadge = currentAirQualityReading
    ? getAirQualityStatusBadge(currentAirQualityReading.value)
    : null;

  const updatedAt = currentAirQualityReading
    ? new Date(currentAirQualityReading.createdAt)
    : null;

  const handleRemove = () => {
    deleteDevice({ id: device.id });
  };
  
  return (
    <li className="flex flex-col gap-3 rounded border border-slate-300 p-4">
      <div className="flex flex-col">
          <div className="space-y-4">

            <div className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-sm text-slate-700">
              <div className="flex w-full">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Device
                  </p>
                  <p className="font-mono text-sm font-semibold text-slate-900">
                    {device.id}
                  </p>
                </div>
                <div className="flex w-full items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mr-2"
                        isPending={isPendingDeletion}
                      >
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <Edit2 />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleRemove}>
                        <Trash />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {device.description || "—"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Latest AQI
                  </p>
                  {currentAirQualityReading ? (
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-slate-900">
                        {currentAirQualityReading.value}
                      </span>
                      <span className="text-xs text-slate-500">AQI</span>
                      {statusBadge ? (
                        <span
                          className={`ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusBadge.badgeClass}`}
                        >
                          {statusBadge.label}
                        </span>
                      ) : null}
                    </div>
                  ) : isPendingReadings ? (
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-400">
                      <Spinner /> Loading
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">No readings</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Trend
                  </p>
                  <div className="mt-1">
                    {trendDelta === null ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                        <Minus className="h-3.5 w-3.5" />
                        No data
                      </span>
                    ) : (
                      <TrendPill delta={trendDelta} />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Updated
                  </p>
                  {updatedAt ? (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-sm font-medium text-slate-900">
                        {formatDateTime(updatedAt)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getRelativeTimeFromNow(updatedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">--</p>
                  )}
                </div>
              </div>
            </div>

            { !readings || readings.length === 0 ? (
              undefined
            ) : <ReadingsChart readings={airQualityReadings} /> }
          </div>
      </div>
    </li>
  );
}


const chartConfig = {
  airQuality: {
    label: "Air Quality",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

const bands = [
  { from: 0, to: 50, color: "#00c853" },
  { from: 50, to: 100, color: "#64dd17" },
  { from: 100, to: 200, color: "#fdd835" },
  { from: 200, to: 300, color: "#ffb300" },
  { from: 300, to: 400, color: "#fb8c00" },
  { from: 400, to: 500, color: "#d50000" },
];

function ReadingsChart({ readings }: { readings: Reading[] }) {
  const data = useMemo(() => {
    return readings.map((v) => ({
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
          right: 12,
        }}
      >
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
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
        {bands.map((band) => (
          <ReferenceArea
            key={band.from + "-" + band.to}
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
  );
}

/* trend and time */

const statusLevels = [
  {
    limit: 50,
    label: "Excellent",
    badgeClass:
      "border-emerald-200 bg-emerald-50/80 text-emerald-700 shadow-inner shadow-emerald-100",
  },
  {
    limit: 100,
    label: "Good",
    badgeClass:
      "border-lime-200 bg-lime-50/80 text-lime-700 shadow-inner shadow-lime-100",
  },
  {
    limit: 200,
    label: "Moderate",
    badgeClass:
      "border-amber-200 bg-amber-50/80 text-amber-700 shadow-inner shadow-amber-100",
  },
  {
    limit: 300,
    label: "Unhealthy",
    badgeClass:
      "border-orange-200 bg-orange-50/80 text-orange-700 shadow-inner shadow-orange-100",
  },
  {
    limit: 500,
    label: "Hazardous",
    badgeClass:
      "border-rose-200 bg-rose-50/80 text-rose-700 shadow-inner shadow-rose-100",
  },
] as const;

function getAirQualityStatusBadge(value: number) {
  return (
    statusLevels.find((level) => value <= level.limit) ??
    statusLevels[statusLevels.length - 1]
  );
}

function formatDateTime(date: Date) {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeTimeFromNow(date: Date) {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function TrendPill({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
        <Minus className="h-3.5 w-3.5" />
        Stable
      </span>
    );
  }

  const rising = delta > 0;
  const Icon = rising ? ArrowUpRight : ArrowDownRight;
  const tone = rising
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-inner ${tone}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(delta)} pts/min
    </span>
  );
}

function getSmoothedTrend(readings: Reading[], minutes: number) {
  if (readings.length < 1) return null;

  const latest = readings[readings.length - 1];
  const windowStart = new Date(new Date(latest.createdAt).getTime() - minutes * 60 * 1000);
  const mappedReadings = readings
    .map(v => ({...v, createdAt: new Date(v.createdAt)}));

  let windowReadings = mappedReadings.filter(r => r.createdAt >= windowStart);
  
  if(windowReadings.length < 2 && readings.length >= 2)
    windowReadings = mappedReadings.slice(mappedReadings.length-2, mappedReadings.length)
  else if (windowReadings.length < 2)
    return null;
  
  // Convert timestamps to minutes relative to the first point
  const t0 = windowReadings[0].createdAt.getTime();

  const xs = windowReadings.map(r => (r.createdAt.getTime() - t0) / 60000); // minutes
  const ys = windowReadings.map(r => r.value);

  const n = xs.length;

  // Compute sums
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0);

  // Slope (units per minute)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  return Math.round(slope);
}