"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CumulativePnlPoint } from "@/lib/types";
import { formatDate } from "@/lib/utils/dates";

const chartConfig = {
  cumulative: {
    label: "Cumulative P&L",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface PnlCurveProps {
  data: CumulativePnlPoint[];
}

export function PnlCurve({ data }: PnlCurveProps) {
  if (data.length === 0) return null;

  const isPositive = data[data.length - 1]?.cumulative >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Cumulative P&L Curve
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={60}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#16a34a" : "#dc2626"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#16a34a" : "#dc2626"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="cumulative"
              type="monotone"
              stroke={isPositive ? "#16a34a" : "#dc2626"}
              fill="url(#fillCumulative)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
