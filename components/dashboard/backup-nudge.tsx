"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAllDataJSON, downloadFile } from "@/lib/utils/export";

const BACKUP_KEY = "hisaab_last_backup";
const DISMISS_KEY = "hisaab_backup_dismissed";
const NUDGE_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const TRADE_THRESHOLD = 100;

interface BackupNudgeProps {
  tradeCount: number;
}

export function BackupNudge({ tradeCount }: BackupNudgeProps) {
  const [visible, setVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (tradeCount === 0) return;

    const lastBackup = localStorage.getItem(BACKUP_KEY);
    const dismissed = localStorage.getItem(DISMISS_KEY);

    // Don't show if dismissed within the last 7 days
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Show if never backed up and has enough trades
    if (!lastBackup && tradeCount >= TRADE_THRESHOLD) {
      setVisible(true);
      return;
    }

    // Show if last backup was more than 30 days ago
    if (lastBackup) {
      const elapsed = Date.now() - parseInt(lastBackup, 10);
      if (elapsed > NUDGE_INTERVAL_MS) {
        setVisible(true);
      }
    }
  }, [tradeCount]);

  if (!visible) return null;

  const handleBackup = async () => {
    setExporting(true);
    try {
      const json = await exportAllDataJSON();
      const date = new Date().toISOString().split("T")[0];
      downloadFile(json, `hisaab-backup-${date}.json`, "application/json");
      localStorage.setItem(BACKUP_KEY, String(Date.now()));
      setVisible(false);
    } finally {
      setExporting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
      <Download className="size-4 text-primary shrink-0" />
      <p className="flex-1 text-muted-foreground">
        <span className="font-medium text-foreground">
          {tradeCount} trades
        </span>{" "}
        stored in your browser. Back up to avoid data loss.
      </p>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 text-xs"
        onClick={handleBackup}
        disabled={exporting}
      >
        {exporting ? "Exporting..." : "Backup now"}
      </Button>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
