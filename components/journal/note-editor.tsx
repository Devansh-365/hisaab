"use client";

import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";

interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function NoteEditor({
  value,
  onChange,
  placeholder = "Why did you take this trade? What did you learn?",
}: NoteEditorProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = useCallback(() => {
    if (localValue !== value) {
      onChange(localValue);
    }
  }, [localValue, value, onChange]);

  return (
    <Textarea
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="min-h-[60px] text-xs resize-none"
    />
  );
}
