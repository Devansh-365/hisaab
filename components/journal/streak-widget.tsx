"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JournalingStreak } from "@/lib/types";
import { Flame } from "lucide-react";

interface StreakWidgetProps {
  streak: JournalingStreak;
  unreviewed: number;
}

export function StreakWidget({ streak, unreviewed }: StreakWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          Journal Streak
        </CardTitle>
        <Flame className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">
          {streak.current} {streak.current === 1 ? "day" : "days"}
        </div>
        <p className="text-xs text-muted-foreground">
          Best: {streak.longest}d
          {unreviewed > 0 && ` | ${unreviewed} unreviewed`}
        </p>
      </CardContent>
    </Card>
  );
}
