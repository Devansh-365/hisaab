"use client";

import { useState, useMemo } from "react";
import { useMatchedTrades, useAnnotationStats } from "@/hooks/use-trades";
import { useDebounce } from "@/hooks/use-debounce";
import { TradeAnnotation } from "@/components/journal/trade-annotation";
import { ManualEntryForm } from "@/components/journal/manual-entry-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPnl } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { BookOpen } from "lucide-react";
import { ChevronDown, Search, AlertCircle, Plus } from "lucide-react";
import { StarRating } from "@/components/journal/star-rating";

export default function JournalPage() {
  const allTrades = useMatchedTrades();
  const stats = useAnnotationStats();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "reviewed" | "unreviewed">(
    "all"
  );
  const [showManualEntry, setShowManualEntry] = useState(false);
  const debouncedSearch = useDebounce(search);

  const closed = useMemo(
    () =>
      allTrades
        .filter((t) => t.status === "CLOSED")
        .sort((a, b) => b.exitDate.localeCompare(a.exitDate)),
    [allTrades]
  );

  const filtered = useMemo(() => {
    let result = closed;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((t) => t.symbol.toLowerCase().includes(q));
    }
    if (filter === "reviewed") {
      result = result.filter(
        (t) => t.notes || (t.tags && t.tags.length > 0) || t.rating
      );
    }
    if (filter === "unreviewed") {
      result = result.filter(
        (t) => !t.notes && (!t.tags || t.tags.length === 0) && !t.rating
      );
    }
    return result;
  }, [closed, search, filter]);

  if (allTrades.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No trades to journal"
        description="Upload your broker tradebook first, then come back to annotate your trades with notes, tags, and ratings."
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader title="Journal">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowManualEntry(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Trade
        </Button>
      </PageHeader>

      {/* Manual Entry Dialog (bottom sheet on mobile) */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trade Manually</DialogTitle>
            <DialogDescription>
              Add trades from unsupported brokers or paper trades.
            </DialogDescription>
          </DialogHeader>
          <ManualEntryForm />
        </DialogContent>
      </Dialog>

      {/* Stats bar */}
      {stats.unreviewed > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertCircle className="h-4 w-4 text-primary" />
            <p className="text-sm">
              You have{" "}
              <span className="font-semibold text-primary">
                {stats.unreviewed} unreviewed trades
              </span>
              . Tag and annotate them to track your patterns.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "unreviewed", "reviewed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs capitalize"
            >
              {f}
              {f === "unreviewed" && stats.unreviewed > 0 && (
                <span className="ml-1 text-[10px]">
                  ({stats.unreviewed})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Trade list with expandable annotations */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Dir</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((trade) => {
                  const pnl = formatPnl(trade.pnl);
                  const isExpanded = expandedId === trade.id;
                  return (
                    <Fragment key={trade.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : trade.id)
                        }
                      >
                        <TableCell>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDate(trade.exitDate)}
                        </TableCell>
                        <TableCell className="font-medium text-xs">
                          {trade.symbol}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trade.direction === "LONG"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px] px-1.5"
                          >
                            {trade.direction}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right text-xs font-medium ${pnl.className}`}
                        >
                          {pnl.text}
                        </TableCell>
                        <TableCell>
                          <StarRating
                            value={trade.rating ?? 0}
                            onChange={() => {}}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap max-w-[200px]">
                            {trade.tags?.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[9px] px-1"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {trade.emotion && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 border-primary/30 text-primary"
                              >
                                {trade.emotion}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-3">
                            <TradeAnnotation trade={trade} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      {search
                        ? "No trades match your search"
                        : "No trades to review"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

// Need Fragment for adjacent table rows
import { Fragment } from "react";
