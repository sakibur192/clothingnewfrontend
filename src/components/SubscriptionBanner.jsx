// ============================================================
// SUBSCRIPTION BANNER
// ============================================================
// Shown at the top of the tenant admin panel so the owner always
// knows where they stand - no surprises when something suddenly
// stops working. Only renders when there's something worth
// telling them (expiring soon, expired, or suspended).
// ============================================================

import { useEffect, useState } from "react";
import { getSubscriptionStatus } from "../api/api";

export default function SubscriptionBanner() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSubscriptionStatus()
      .then(setStatus)
      .catch(() => {}); // silent - this is a nice-to-have banner, not critical path
  }, []);

  if (!status) return null;

  if (status.status === "suspended") {
    return (
      <div className="subscription-banner banner-danger">
        Your account is suspended. Please contact support to resolve this.
      </div>
    );
  }

  if (status.status === "expired") {
    return (
      <div className="subscription-banner banner-danger">
        Your subscription has expired - you can still view your data, but adding or changing anything
        is paused until you renew.
      </div>
    );
  }

  if (status.status === "trial" && status.daysRemaining !== null && status.daysRemaining <= 3) {
    return (
      <div className="subscription-banner banner-warning">
        Your free trial ends in {status.daysRemaining} day{status.daysRemaining === 1 ? "" : "s"}. Contact
        your platform provider to activate a paid plan and keep your store running.
      </div>
    );
  }

  return null;
}
