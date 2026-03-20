"use client";

import Link from "next/link";

interface PageHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Hisaab
          </Link>
          {title && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <h1 className="text-sm font-semibold text-foreground">{title}</h1>
            </>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2">{children}</div>
        )}
      </div>
    </header>
  );
}
