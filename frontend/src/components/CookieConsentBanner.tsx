import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'cookie-consent';
const CONSENT_VALUE = 'accepted';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored !== CONSENT_VALUE) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, CONSENT_VALUE);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-t bg-background px-6 py-4 shadow-lg"
    >
      <p className="text-sm text-muted-foreground">
        LiterRater uses a session cookie to keep you signed in. No tracking or advertising cookies
        are used. By clicking &ldquo;Accept&rdquo; you consent to this essential cookie.{' '}
        <a href="/privacy" className="text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </a>
      </p>
      <Button onClick={handleAccept} size="sm" className="shrink-0">
        Accept
      </Button>
    </div>
  );
}
