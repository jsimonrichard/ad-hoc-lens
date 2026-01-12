import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COOKIE_CONSENT_KEY = "posthog-cookie-consent";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    posthog?.opt_in_capturing();
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    posthog?.opt_out_capturing();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:slide-out-to-bottom-2 data-open:slide-in-from-bottom-2",
        "bg-background ring-foreground/10 rounded-xl p-4 ring-1 shadow-lg",
        "max-w-sm w-[calc(100%-2rem)] sm:w-full",
        "flex flex-col gap-3"
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Cookie Preferences</h3>
        <p className="text-xs text-muted-foreground">
          We use cookies to improve your experience and analyze how you use our
          application. You can accept or decline analytics cookies.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecline}
          className="flex-1"
        >
          Decline
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleAccept}
          className="flex-1"
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
