"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseFile } from "@/lib/parsers";
import { matchTradesFIFO } from "@/lib/matching/fifo";
import { storeTrades, storeMatchedTrades, storeImport } from "@/hooks/use-trades";
import { db } from "@/lib/storage/db";
import { ulid } from "ulid";
import type { ParseResult } from "@/lib/types";

interface DropZoneProps {
  onComplete?: () => void;
}

type ImportState =
  | { status: "idle" }
  | { status: "parsing"; fileName: string }
  | { status: "success"; result: ParseResult; addedCount: number }
  | { status: "error"; message: string };

export function DropZone({ onComplete }: DropZoneProps) {
  const [state, setState] = useState<ImportState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setState({ status: "parsing", fileName: file.name });

      try {
        const result = await parseFile(file);

        if (result.trades.length === 0) {
          const errorMsg =
            result.errors.length > 0
              ? result.errors[0].message
              : "No trades found in file";
          setState({ status: "error", message: errorMsg });
          return;
        }

        // Store raw trades (with dedup)
        const addedCount = await storeTrades(result.trades);

        // Store import record
        await storeImport({
          id: ulid(),
          fileName: file.name,
          broker: result.meta.broker,
          tradeCount: addedCount,
          importedAt: new Date().toISOString(),
          errors: result.errors.length,
        });

        // Re-match ALL trades (not just new ones)
        const allTrades = await db.trades.toArray();
        const matched = matchTradesFIFO(allTrades);
        await storeMatchedTrades(matched);

        setState({ status: "success", result, addedCount });

        // Navigate to dashboard after short delay
        setTimeout(() => {
          onComplete?.();
        }, 1500);
      } catch (err) {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to parse file",
        });
      }
    },
    [onComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : state.status === "error"
            ? "border-destructive/50"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
    >
      <CardContent
        className="flex flex-col items-center justify-center gap-4 p-10 text-center cursor-pointer"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          className="hidden"
        />

        {state.status === "idle" && (
          <>
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">
                Drop your tradebook CSV or XLSX here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports Zerodha & Groww exports. Click to browse.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-muted px-2 py-1 rounded">
                Zerodha CSV
              </span>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                Groww XLSX
              </span>
            </div>
          </>
        )}

        {state.status === "parsing" && (
          <>
            <div className="rounded-full bg-muted p-4 animate-pulse">
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Parsing {state.fileName}...
            </p>
          </>
        )}

        {state.status === "success" && (
          <>
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-green-600">
                {state.addedCount} trades imported!
              </p>
              {state.result.errors.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {state.result.errors.length} rows skipped
                </p>
              )}
            </div>
          </>
        )}

        {state.status === "error" && (
          <>
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-destructive">
                {state.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setState({ status: "idle" });
                }}
              >
                Try again
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
