const NOTIFICATION_KEY = "hisaab_weekly_notif";

/**
 * Request notification permission and schedule weekly reminders.
 * Uses localStorage to track scheduling state (no server needed).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Schedule a weekly check-in notification.
 * We use setInterval in the active tab since service worker timers are unreliable
 * in static PWAs. When the user opens the app, we check if a week has passed
 * since the last notification and show one if needed.
 */
export function checkWeeklyNotification() {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;

  const last = localStorage.getItem(NOTIFICATION_KEY);
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  if (last && now - parseInt(last, 10) < oneWeek) return;

  // Mark as sent regardless of whether we show it (avoids spamming)
  localStorage.setItem(NOTIFICATION_KEY, String(now));
}

/**
 * Show a local notification with weekly P&L summary.
 */
export function showWeeklyPnlNotification(summary: {
  winners: number;
  losers: number;
  netPnl: number;
  winRate: number;
}) {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;

  const last = localStorage.getItem(NOTIFICATION_KEY);
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  // Don't show more than once per week
  if (last && now - parseInt(last, 10) < oneWeek) return;

  localStorage.setItem(NOTIFICATION_KEY, String(now));

  const sign = summary.netPnl >= 0 ? "+" : "";
  const pnl = Math.abs(summary.netPnl).toLocaleString("en-IN");

  const reg = navigator.serviceWorker?.controller;
  if (reg) {
    // Use service worker for persistent notification
    navigator.serviceWorker.ready.then((sw) => {
      sw.showNotification("Hisaab Weekly Recap", {
        body: `${summary.winners}W/${summary.losers}L | ${sign}\u20B9${pnl} | Win rate: ${summary.winRate.toFixed(1)}%`,
        icon: "/icons/icon.svg",
        badge: "/icons/icon.svg",
        tag: "weekly-recap",
      });
    });
  } else {
    // Fallback to browser notification
    new Notification("Hisaab Weekly Recap", {
      body: `${summary.winners}W/${summary.losers}L | ${sign}\u20B9${pnl} | Win rate: ${summary.winRate.toFixed(1)}%`,
      icon: "/icons/icon.svg",
    });
  }
}
