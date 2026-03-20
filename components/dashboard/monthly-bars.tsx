"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyPnl } from "@/lib/types";

const chartConfig = {
  pnl: {
    label: "P&L",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface MonthlyBarsProps {
  data: MonthlyPnl[];
}

export function MonthlyBars({ data }: MonthlyBarsProps) {
  if (data.length === 0) return null;

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.month + "-01").toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Monthly P&L</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={formatted} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={60}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {formatted.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.pnl >= 0 ? "#16a34a" : "#dc2626"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
