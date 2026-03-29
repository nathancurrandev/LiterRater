import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Who we are</h2>
            <p>
              LiterRater (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a book-tracking and
              review platform. Questions about this policy can be directed to{' '}
              <a href="mailto:privacy@literrater.example" className="text-primary hover:underline">
                privacy@literrater.example
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Data we collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Account information:</strong> email address, username, and display name
                provided at registration.
              </li>
              <li>
                <strong>Reading log:</strong> books you add to your shelf, reading status, start and
                finish dates, and personal notes.
              </li>
              <li>
                <strong>Ratings and reviews:</strong> star ratings (1–5) and written reviews you
                submit for books.
              </li>
              <li>
                <strong>Profile information:</strong> optional biography and avatar you choose to
                add.
              </li>
              <li>
                <strong>Usage data:</strong> standard server logs (IP address, browser user-agent,
                pages visited) retained for up to 90 days for security and debugging.
              </li>
              <li>
                <strong>Cookies:</strong> a single session cookie used to keep you signed in. No
                third-party tracking cookies are set without your explicit consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How we use your data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and operate the LiterRater service.</li>
              <li>To personalise your feed with activity from people you follow.</li>
              <li>To calculate aggregate book ratings shown to all users.</li>
              <li>To send transactional emails (e.g. password reset) — never marketing without consent.</li>
              <li>To detect and prevent abuse or unauthorised access.</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Your rights under GDPR</h2>
            <p>
              If you are located in the European Economic Area or the UK, you have the following
              rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Right of access:</strong> request a copy of all data we hold about you.
              </li>
              <li>
                <strong>Right to erasure:</strong> request deletion of your account and all
                associated personal data.
              </li>
              <li>
                <strong>Right to data portability:</strong> export your reading log, ratings, and
                reviews in a machine-readable format (JSON/CSV).
              </li>
              <li>
                <strong>Right to rectification:</strong> correct inaccurate data held about you.
              </li>
              <li>
                <strong>Right to restrict processing:</strong> ask us to pause processing your data
                in certain circumstances.
              </li>
            </ul>
            <p className="mt-2">
              You can exercise your access, erasure, and portability rights directly from your{' '}
              <a href="/account" className="text-primary hover:underline">
                Account Settings
              </a>{' '}
              page. For other requests, contact us at{' '}
              <a href="mailto:privacy@literrater.example" className="text-primary hover:underline">
                privacy@literrater.example
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data retention</h2>
            <p>
              Your account data is retained for as long as your account is active. Deleted accounts
              are purged from our systems within 30 days. Anonymised aggregate statistics (e.g.
              book rating counts) may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Security</h2>
            <p>
              Passwords are stored as salted hashes (bcrypt). All data is transmitted over HTTPS.
              We apply regular security audits and follow industry-standard practices to protect
              your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Contact</h2>
            <p>
              For any privacy-related enquiries, please email{' '}
              <a href="mailto:privacy@literrater.example" className="text-primary hover:underline">
                privacy@literrater.example
              </a>
              . We aim to respond within 30 days.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
