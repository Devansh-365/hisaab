"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "sm" }: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className="cursor-pointer hover:scale-110 transition-transform"
        >
          <Star
            className={cn(
              iconSize,
              star <= value
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
