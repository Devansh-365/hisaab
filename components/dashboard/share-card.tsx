"use client";

import { useRef, useState } from "react";
import { Share2, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { DashboardKPIs } from "@/lib/types";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

interface ShareCardProps {
  kpis: DashboardKPIs;
  financialYear: string;
}

function formatINR(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 10000000) return `${(n / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${(n / 100000).toFixed(2)}L`;
  return n.toLocaleString("en-IN");
}

export function ShareCardButton({ kpis, financialYear }: ShareCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 600;
    const h = 400;
    canvas.width = w;
    canvas.height = h;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle border
    ctx.strokeStyle = "rgba(36, 131, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    // Title
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 14px system-ui, sans-serif";
    ctx.fillText(`My Trading Stats  |  ${financialYear || "All Time"}`, 40, 52);

    // Net P&L
    const pnlColor = kpis.netPnl >= 0 ? "#22c55e" : "#ef4444";
    ctx.fillStyle = pnlColor;
    ctx.font = "700 36px system-ui, sans-serif";
    const sign = kpis.netPnl >= 0 ? "+" : "";
    ctx.fillText(`${sign}\u20B9${formatINR(kpis.netPnl)}`, 40, 105);

    // Stats grid
    const stats = [
      { label: "Win Rate", value: `${kpis.winRate.toFixed(1)}%` },
      { label: "Trades", value: String(kpis.totalTrades) },
      { label: "Profit Factor", value: kpis.profitFactor === Infinity ? "--" : kpis.profitFactor.toFixed(2) },
      { label: "Avg Win", value: `\u20B9${formatINR(kpis.avgWin)}` },
      { label: "Avg Loss", value: `\u20B9${formatINR(Math.abs(kpis.avgLoss))}` },
      { label: "W / L", value: `${kpis.winners}W / ${kpis.losers}L` },
    ];

    const colW = (w - 80) / 3;
    stats.forEach((stat, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 40 + col * colW;
      const y = 150 + row * 80;

      ctx.fillStyle = "#64748b";
      ctx.font = "500 12px system-ui, sans-serif";
      ctx.fillText(stat.label, x, y);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "700 22px system-ui, sans-serif";
      ctx.fillText(stat.value, x, y + 28);
    });

    // Divider
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 340);
    ctx.lineTo(w - 40, 340);
    ctx.stroke();

    // Watermark
    ctx.fillStyle = "#475569";
    ctx.font = "500 12px system-ui, sans-serif";
    ctx.fillText(`${SITE_URL.replace("https://", "")}`, 40, 370);

    ctx.fillStyle = "#334155";
    ctx.font = "400 11px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Powered by Metis", w - 40, 370);
    ctx.textAlign = "left";
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `hisaab-stats-${financialYear || "all-time"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "hisaab-stats.png", { type: "image/png" });
      const shareText = `My trading stats via ${SITE_NAME} (free, no signup)\n${SITE_URL}`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ text: shareText, files: [file] });
          return;
        } catch {
          // User cancelled or share failed, fall through to copy
        }
      }

      // Fallback: copy image to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Final fallback: just download
        handleDownload();
      }
    }, "image/png");
  };

  const handleOpen = () => {
    setOpen(true);
    // Generate after dialog opens (canvas needs to be rendered)
    setTimeout(generateCard, 50);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <Share2 className="size-4 mr-1" />
        Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[660px]">
          <DialogHeader>
            <DialogTitle>Share your stats</DialogTitle>
            <DialogDescription>
              Download or share to WhatsApp, Twitter, and more.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg overflow-hidden border bg-muted">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ imageRendering: "auto" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button className="flex-1" onClick={handleShare}>
              {copied ? (
                <>
                  <Check className="size-4 mr-1" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="size-4 mr-1" /> Share
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="size-4 mr-1" />
              Download PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
