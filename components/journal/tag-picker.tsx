"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STRATEGY_TAGS, EMOTION_TAGS } from "@/lib/types";

interface TagPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  type: "strategy" | "emotion";
}

export function TagPicker({ selectedTags, onTagsChange, type }: TagPickerProps) {
  const tags = type === "strategy" ? STRATEGY_TAGS : EMOTION_TAGS;

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <Badge
            key={tag}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-[10px] px-2 py-0.5 transition-colors",
              isSelected && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        );
      })}
    </div>
  );
}
