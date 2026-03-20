"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StrategyBreakdown } from "@/lib/types";
import { formatINR, formatPnl } from "@/lib/utils/format";

interface StrategyBreakdownTableProps {
  data: StrategyBreakdown[];
}

export function StrategyBreakdownTable({ data }: StrategyBreakdownTableProps) {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Strategy Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">Trades</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">Avg P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const pnl = formatPnl(row.pnl);
              const avgPnl = formatPnl(row.avgPnl);
              return (
                <TableRow key={row.tag}>
                  <TableCell>
                    <Badge
                      variant={row.tag === "untagged" ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {row.tag}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.trades}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.winRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className={`text-right text-xs font-medium ${pnl.className}`}>
                    {pnl.text}
                  </TableCell>
                  <TableCell className={`text-right text-xs ${avgPnl.className}`}>
                    {avgPnl.text}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
