"use client";

import { useCallback } from "react";
import { StarRating } from "./star-rating";
import { TagPicker } from "./tag-picker";
import { NoteEditor } from "./note-editor";
import { updateTradeAnnotations } from "@/hooks/use-trades";
import type { MatchedTradeRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TradeAnnotationProps {
  trade: MatchedTradeRecord;
}

export function TradeAnnotation({ trade }: TradeAnnotationProps) {
  const handleNotesChange = useCallback(
    (notes: string) => {
      updateTradeAnnotations(trade.id, { notes });
    },
    [trade.id]
  );

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      updateTradeAnnotations(trade.id, { tags });
    },
    [trade.id]
  );

  const handleEmotionChange = useCallback(
    (emotion: string) => {
      updateTradeAnnotations(trade.id, {
        emotion: emotion === trade.emotion ? undefined : emotion,
      });
    },
    [trade.id, trade.emotion]
  );

  const handleRatingChange = useCallback(
    (rating: number) => {
      updateTradeAnnotations(trade.id, { rating: rating || undefined });
    },
    [trade.id]
  );

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
      {/* Rating */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-20">Quality</span>
        <StarRating value={trade.rating ?? 0} onChange={handleRatingChange} />
      </div>

      <Separator />

      {/* Strategy Tags */}
      <div className="space-y-1.5">
        <span className="text-xs text-muted-foreground">Strategy</span>
        <TagPicker
          selectedTags={trade.tags ?? []}
          onTagsChange={handleTagsChange}
          type="strategy"
        />
      </div>

      <Separator />

      {/* Emotion */}
      <div className="space-y-1.5">
        <span className="text-xs text-muted-foreground">Emotion</span>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              "disciplined",
              "fomo",
              "revenge",
              "fear",
              "greed",
              "patient",
              "impulsive",
            ] as const
          ).map((emotion) => (
            <Badge
              key={emotion}
              variant={trade.emotion === emotion ? "default" : "outline"}
              className="cursor-pointer text-[10px] px-2 py-0.5 transition-colors"
              onClick={() => handleEmotionChange(emotion)}
            >
              {emotion}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="space-y-1.5">
        <span className="text-xs text-muted-foreground">Notes</span>
        <NoteEditor value={trade.notes ?? ""} onChange={handleNotesChange} />
      </div>
    </div>
  );
}
