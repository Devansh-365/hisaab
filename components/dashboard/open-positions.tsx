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
import type { MatchedTradeRecord } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";

interface OpenPositionsProps {
  trades: MatchedTradeRecord[];
}

export function OpenPositions({ trades }: OpenPositionsProps) {
  const open = trades.filter((t) => t.status === "OPEN");

  if (open.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Open Positions ({open.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Entry Price</TableHead>
              <TableHead className="text-right">Entry Date</TableHead>
              <TableHead className="text-right">Days Held</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {open.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="font-medium text-xs">
                  {trade.symbol}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      trade.direction === "LONG" ? "default" : "secondary"
                    }
                    className="text-[10px] px-1.5"
                  >
                    {trade.direction}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs">
                  {trade.quantity}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatINR(trade.entryPrice, true)}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatDate(trade.entryDate)}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {trade.holdingDays}d
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
