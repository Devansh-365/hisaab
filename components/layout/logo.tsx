import { SITE_NAME } from "@/lib/constants";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="size-5 shrink-0"
        aria-hidden="true"
      >
        <rect width="512" height="512" rx="96" fill="currentColor" className="text-primary" />
        <rect x="128" y="96" width="56" height="320" rx="28" fill="white" fillOpacity="0.4" />
        <rect x="148" y="96" width="252" height="320" rx="16" fill="white" />
        <rect x="192" y="168" width="160" height="14" rx="7" fill="currentColor" className="text-primary" fillOpacity="0.45" />
        <rect x="192" y="216" width="120" height="14" rx="7" fill="currentColor" className="text-primary" fillOpacity="0.3" />
        <rect x="192" y="264" width="160" height="14" rx="7" fill="currentColor" className="text-primary" fillOpacity="0.45" />
        <rect x="192" y="312" width="100" height="14" rx="7" fill="currentColor" className="text-primary" fillOpacity="0.3" />
        <rect x="332" y="96" width="32" height="80" rx="4" fill="#f97316" />
        <polygon points="332,176 348,160 364,176" fill="#f97316" />
      </svg>
      <span className="font-bold tracking-tight">{SITE_NAME}</span>
    </span>
  );
}
