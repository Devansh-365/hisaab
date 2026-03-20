"use client";

import { Button } from "@/components/ui/button";
import { Upload, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button render={<Link href="/" />}>
            <Upload className="h-4 w-4 mr-1.5" />
            Upload Tradebook
          </Button>
          <Button variant="outline" render={<Link href="/demo" />}>
            Try Demo
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
