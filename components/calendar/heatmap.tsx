"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DailyPnl } from "@/lib/types";
import { formatINR, formatPnl } from "@/lib/utils/format";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeatmapProps {
  dailyData: DailyPnl[];
}

const MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

function getIntensity(pnl: number, maxAbs: number): string {
  if (pnl === 0) return "bg-muted";
  const ratio = Math.min(Math.abs(pnl) / maxAbs, 1);
  if (pnl > 0) {
    if (ratio > 0.6) return "bg-green-600";
    if (ratio > 0.3) return "bg-green-500/70";
    return "bg-green-400/50";
  }
  if (ratio > 0.6) return "bg-red-600";
  if (ratio > 0.3) return "bg-red-500/70";
  return "bg-red-400/50";
}

export function CalendarHeatmap({ dailyData }: CalendarHeatmapProps) {
  const now = new Date();
  const currentFYStart =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const [fyStart, setFYStart] = useState(currentFYStart);

  const fyLabel = `FY${fyStart}-${(fyStart + 1).toString().slice(-2)}`;

  const dataMap = useMemo(() => {
    const map = new Map<string, DailyPnl>();
    for (const d of dailyData) {
      map.set(d.date, d);
    }
    return map;
  }, [dailyData]);

  const maxAbs = useMemo(() => {
    if (dailyData.length === 0) return 1;
    return Math.max(...dailyData.map((d) => Math.abs(d.pnl)));
  }, [dailyData]);

  const [selectedDay, setSelectedDay] = useState<DailyPnl | null>(null);

  // Determine which months have data in this FY
  const monthsWithData = useMemo(() => {
    const set = new Set<string>();
    for (const d of dailyData) {
      set.add(d.date.slice(0, 7)); // "2025-04"
    }
    return set;
  }, [dailyData]);

  // Generate calendar months for the FY, but only render months
  // between the first and last month with data (or all 12 if no data)
  const months = useMemo(() => {
    const allMonths: {
      month: number;
      year: number;
      label: string;
      key: string;
      days: (string | null)[][];
    }[] = [];

    for (let i = 0; i < 12; i++) {
      const monthIdx = (3 + i) % 12; // Apr=3, May=4, ... Mar=2
      const year = monthIdx >= 3 ? fyStart : fyStart + 1;
      const key = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
      const firstDay = new Date(year, monthIdx, 1);
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      const startDow = firstDay.getDay();

      const weeks: (string | null)[][] = [];
      let week: (string | null)[] = new Array(startDow).fill(null);

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        week.push(dateStr);
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
      }

      allMonths.push({ month: monthIdx, year, label: MONTHS[i], key, days: weeks });
    }

    // If no data, show all months
    if (monthsWithData.size === 0) return allMonths;

    // Find range of months with data
    const firstIdx = allMonths.findIndex((m) => monthsWithData.has(m.key));
    const lastIdx = allMonths.findLastIndex((m) => monthsWithData.has(m.key));

    if (firstIdx === -1) return allMonths;

    return allMonths.slice(firstIdx, lastIdx + 1);
  }, [fyStart, monthsWithData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Calendar Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setFYStart(fyStart - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium w-16 text-center">
              {fyLabel}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setFYStart(fyStart + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {months.map((m) => (
            <div key={`${m.year}-${m.month}`} className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground">
                {m.label}
              </p>
              <div className="space-y-0.5">
                {m.days.map((week, wi) => (
                  <div key={wi} className="flex gap-0.5">
                    {week.map((dateStr, di) => {
                      if (!dateStr) {
                        return (
                          <div key={di} className="h-3 w-3 rounded-[2px]" />
                        );
                      }
                      const data = dataMap.get(dateStr);
                      const pnl = data?.pnl ?? 0;
                      const hasTrades = !!data;

                      return (
                        <button
                          key={di}
                          type="button"
                          className={cn(
                            "h-3 w-3 rounded-[2px] transition-all",
                            hasTrades
                              ? getIntensity(pnl, maxAbs)
                              : "bg-muted/50",
                            hasTrades && "cursor-pointer hover:ring-1 hover:ring-primary/50"
                          )}
                          onClick={() =>
                            data && setSelectedDay(selectedDay?.date === dateStr ? null : data)
                          }
                          title={
                            hasTrades
                              ? `${dateStr}: ${formatINR(pnl)} (${data.trades} trades)`
                              : dateStr
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs space-y-1">
            <p className="font-medium">{selectedDay.date}</p>
            <p>
              P&L:{" "}
              <span
                className={
                  selectedDay.pnl >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {formatPnl(selectedDay.pnl).text}
              </span>
              {" | "}
              {selectedDay.trades} trade{selectedDay.trades !== 1 ? "s" : ""}
              {selectedDay.isAnnotated && (
                <span className="text-primary ml-2">reviewed</span>
              )}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 text-[10px] text-muted-foreground">
          <span>Loss</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-[2px] bg-red-600" />
            <div className="h-3 w-3 rounded-[2px] bg-red-500/70" />
            <div className="h-3 w-3 rounded-[2px] bg-red-400/50" />
            <div className="h-3 w-3 rounded-[2px] bg-muted" />
            <div className="h-3 w-3 rounded-[2px] bg-green-400/50" />
            <div className="h-3 w-3 rounded-[2px] bg-green-500/70" />
            <div className="h-3 w-3 rounded-[2px] bg-green-600" />
          </div>
          <span>Profit</span>
        </div>
      </CardContent>
    </Card>
  );
}
