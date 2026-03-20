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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const PAGE_SIZE = 50;

interface TradeTableProps {
  trades: MatchedTradeRecord[];
}

type SortKey = "exitDate" | "symbol" | "pnl" | "pnlPercent" | "holdingDays";
type SortDir = "asc" | "desc";

export function TradeTable({ trades }: TradeTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("exitDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const closed = useMemo(
    () => trades.filter((t) => t.status === "CLOSED"),
    [trades]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = closed.filter((t) => t.symbol.toLowerCase().includes(q));
    setPage(0); // reset page on search
    return result;
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

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const paginated = sorted.slice(pageStart, pageEnd);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
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
        <div className="overflow-auto">
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
              {paginated.map((trade) => {
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
                    <TableCell
                      className={`text-right text-xs font-medium ${pnl.className}`}
                    >
                      {pnl.text}
                    </TableCell>
                    <TableCell
                      className={`text-right text-xs ${
                        trade.pnlPercent >= 0
                          ? "text-green-600"
                          : "text-red-600"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {pageStart + 1}-{Math.min(pageEnd, sorted.length)} of{" "}
              {sorted.length}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 0 && setPage(page - 1)}
                    className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    text=""
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((i) => {
                    // Show first, last, and pages near current
                    if (i === 0 || i === totalPages - 1) return true;
                    if (Math.abs(i - page) <= 1) return true;
                    return false;
                  })
                  .map((i, idx, arr) => {
                    const items = [];
                    // Insert ellipsis if gap between visible pages
                    if (idx > 0 && i - arr[idx - 1] > 1) {
                      items.push(
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    items.push(
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={i === page}
                          onClick={() => setPage(i)}
                          className="cursor-pointer text-xs"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                    return items;
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages - 1 && setPage(page + 1)}
                    className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    text=""
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
