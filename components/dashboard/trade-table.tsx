"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchedTradeRecord } from "@/lib/types";
import { formatINR, formatPnl, formatPercent } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradeTableProps {
  trades: MatchedTradeRecord[];
}

type SortKey = "exitDate" | "symbol" | "pnl" | "pnlPercent" | "holdingDays";
type SortDir = "asc" | "desc";

export function TradeTable({ trades }: TradeTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("exitDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const closed = useMemo(
    () => trades.filter((t) => t.status === "CLOSED"),
    [trades]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return closed.filter((t) => t.symbol.toLowerCase().includes(q));
  }, [closed, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "exitDate":
          cmp = a.exitDate.localeCompare(b.exitDate);
          break;
        case "symbol":
          cmp = a.symbol.localeCompare(b.symbol);
          break;
        case "pnl":
          cmp = a.pnl - b.pnl;
          break;
        case "pnlPercent":
          cmp = a.pnlPercent - b.pnlPercent;
          break;
        case "holdingDays":
          cmp = a.holdingDays - b.holdingDays;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const SortHeader = ({
    label,
    field,
  }: {
    label: string;
    field: SortKey;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => toggleSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Closed Trades ({closed.length})
          </CardTitle>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortHeader label="Date" field="exitDate" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Symbol" field="symbol" />
                </TableHead>
                <TableHead>Dir</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">
                  <SortHeader label="P&L" field="pnl" />
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader label="%" field="pnlPercent" />
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader label="Days" field="holdingDays" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.slice(0, 100).map((trade) => {
                const pnl = formatPnl(trade.pnl);
                return (
                  <TableRow key={trade.id}>
                    <TableCell className="text-xs">
                      {formatDate(trade.exitDate)}
                    </TableCell>
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
                      {formatINR(trade.exitPrice, true)}
                    </TableCell>
                    <TableCell className={`text-right text-xs font-medium ${pnl.className}`}>
                      {pnl.text}
                    </TableCell>
                    <TableCell
                      className={`text-right text-xs ${
                        trade.pnlPercent >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercent(trade.pnlPercent)}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {trade.holdingDays}d
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    {search
                      ? "No trades match your search"
                      : "No closed trades yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {sorted.length > 100 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Showing 100 of {sorted.length} trades
          </p>
        )}
      </CardContent>
    </Card>
  );
}
