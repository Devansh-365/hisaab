"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Hisaab error:", error);
  }, [error]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="mx-auto rounded-full bg-destructive/10 p-4 w-fit">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Your data is safe in your browser.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            <Home className="h-4 w-4 mr-1.5" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
