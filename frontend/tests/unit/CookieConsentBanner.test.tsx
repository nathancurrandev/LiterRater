import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CookieConsentBanner from '@/components/CookieConsentBanner';

const CONSENT_KEY = 'cookie-consent';
const CONSENT_VALUE = 'accepted';

beforeEach(() => {
  localStorage.clear();
});

describe('CookieConsentBanner', () => {
  it('shows the banner when localStorage has no cookie-consent key', () => {
    render(<CookieConsentBanner />);
    expect(screen.getByRole('region', { name: /cookie consent/i })).toBeInTheDocument();
  });

  it('hides the banner when localStorage already has cookie-consent = accepted', () => {
    localStorage.setItem(CONSENT_KEY, CONSENT_VALUE);
    render(<CookieConsentBanner />);
    expect(screen.queryByRole('region', { name: /cookie consent/i })).not.toBeInTheDocument();
  });

  it('sets localStorage and hides the banner when Accept is clicked', async () => {
    render(<CookieConsentBanner />);
    const banner = screen.getByRole('region', { name: /cookie consent/i });
    expect(banner).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /accept/i }));

    expect(localStorage.getItem(CONSENT_KEY)).toBe(CONSENT_VALUE);
    expect(screen.queryByRole('region', { name: /cookie consent/i })).not.toBeInTheDocument();
  });
});
