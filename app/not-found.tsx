import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm text-center space-y-5">
        <p className="text-6xl font-bold text-primary">404</p>
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button render={<Link href="/" />}>
            <Home className="h-4 w-4 mr-1.5" />
            Go Home
          </Button>
          <Button variant="outline" render={<Link href="/dashboard" />}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
