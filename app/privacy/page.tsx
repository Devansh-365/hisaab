import type { Metadata } from "next";
import {
  SITE_NAME,
  SITE_URL,
  SITE_REPO,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Guarantee",
  description: `${SITE_NAME} is 100% browser-based. Your trading data never leaves your device. No server, no database, no tracking. Verify it yourself.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1 px-4 py-12 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Guarantee</h1>
      <p className="mt-2 text-muted-foreground">
        Your financial data is yours. Here is exactly how {SITE_NAME} protects
        it.
      </p>

      <div className="mt-10 space-y-8">
        {/* Zero Network Requests */}
        <section>
          <h2 className="text-lg font-semibold">
            Zero network requests with your data
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {SITE_NAME} is a static website. After the initial page load, it
            makes{" "}
            <strong className="text-foreground">
              zero outbound network requests
            </strong>{" "}
            with your trade data. Your CSV is parsed in your browser. Your P&L
            is computed in your browser. Your journal notes are stored in your
            browser. Nothing is sent to any server, ever.
          </p>
          <div className="mt-3 rounded-lg border bg-muted/50 p-4 text-xs text-muted-foreground">
            <strong className="text-foreground">How to verify:</strong> Open
            your browser DevTools (F12), go to the Network tab, upload your
            tradebook, and watch. You will see zero requests to any external
            server.
          </div>
        </section>

        {/* No Server */}
        <section>
          <h2 className="text-lg font-semibold">No server, no database</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {SITE_NAME} is deployed as a static export on a CDN. There is no
            backend server, no database, no API, and no authentication system.
            Your data lives in your browser&apos;s IndexedDB storage and nowhere
            else.
          </p>
        </section>

        {/* No Tracking */}
        <section>
          <h2 className="text-lg font-semibold">No analytics tracking</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            No Google Analytics. No Mixpanel. No PostHog. No tracking pixels. No
            cookies. {SITE_NAME} does not collect any usage data, behavioral
            data, or personally identifiable information.
          </p>
        </section>

        {/* Open Source */}
        <section>
          <h2 className="text-lg font-semibold">
            Open source -- verify it yourself
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every line of code is publicly available under the MIT license. You
            don&apos;t have to trust our claims -- you can read the source code
            and verify them yourself.
          </p>
          <a
            href={SITE_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View source code on GitHub
          </a>
        </section>

        {/* Data Ownership */}
        <section>
          <h2 className="text-lg font-semibold">Your data, your control</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">Export</span>
              <span>
                Download all your data as JSON or CSV at any time from the
                dashboard.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">Delete</span>
              <span>
                Clear all data with one click. No &quot;are you sure you want to
                cancel?&quot; dark patterns.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">Self-host</span>
              <span>
                Clone the repo, run{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  npm run build
                </code>
                , and deploy the{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  out/
                </code>{" "}
                folder anywhere.
              </span>
            </li>
          </ul>
        </section>

        {/* Storage Safety */}
        <section>
          <h2 className="text-lg font-semibold">Storage safety</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {SITE_NAME} requests persistent storage from your browser to prevent
            accidental data eviction. We also prompt you to back up your data
            periodically. Since everything is browser-based, we recommend
            exporting a JSON backup regularly -- especially before clearing
            browser data or switching devices.
          </p>
        </section>

        {/* What We DO Send */}
        <section>
          <h2 className="text-lg font-semibold">
            What {SITE_NAME} does send
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            For complete transparency: outbound links to{" "}
            <strong className="text-foreground">trymetis.app</strong> (our
            parent product) include UTM parameters that tell Metis the click
            came from {SITE_NAME}. This tracks the click, not your identity or
            trading data. No trade data, no P&L numbers, no personal information
            is included in these links.
          </p>
        </section>
      </div>
    </div>
  );
}
