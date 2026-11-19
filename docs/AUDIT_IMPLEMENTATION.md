# Vellum House — audit-to-implementation register (V5)

Based on the supplied 24 October 2026 audit workbook and the user's updated requirements on 19 November 2026. Source audit explicitly says it did not independently retest the old live website. These are **implementation statuses**, not claims of live verification.

| Audit issue | V5 change | Status / remaining action |
| --- | --- | --- |
| VH-10 | Enquiry form explicitly POST; JS prevents default; no GET fallback | Implemented, browser/security review pending |
| BF-01 | Google Apps Script saves to private Sheet; notification and acknowledgement emails | Implemented, **requires live deployment and E2E test** |
| VH-02 | Spam honeypot fully visually hidden and ignored | Implemented; browser test pending |
| VH-07 | Only Vellum House admin notification; minimal optional fields, public notice | Partial: access policy, retention and safeguarding review needed |
| VH-01 | Dedicated black slots for permissioned results/stories/testimonials | Content pending: cannot fabricate evidence |
| VH-03 | Prominent Point A-to-B promise and illustrative roadmap/report | Implemented; validate with parents |
| VH-06 | Explicit statement of accountability without admission guarantees | Implemented |
| BF-02 | Founder profiles and media placeholders | Partial: final biographies/photographs/roles need sign-off |
| BF-03 | Public privacy and terms drafts | Partial: legal jurisdiction, cancellation/refunds, retention sign-off needed |
| VH-04 | Clear 30-minute call explanation, meeting attendees and next step | Implemented |
| VH-05 | Distinction between full management and individual services | Implemented |
| BF-04 | No student name collected; guardian/contact name only | Implemented |
| VH-08 | Funnel events/measurement plan in deployment guide | Planned; needs a privacy-conscious analytics decision |
| VH-12 | Unique meta descriptions for every bilingual route | Implemented |
| VH-13 | Canonical + absolute hreflang/OG URLs; robots, sitemap, CNAME | Implemented; verify deployed domain |
| VH-11 | No unsupported matchMedia event listener; separated form/interactive logic | Implemented; cross-browser QA pending |
| VH-14 | Booking URL configured once in assets/config.js | Implemented; backend ack link still needs to match if ever changed |
| VH-15 | Source checker for links, metadata and form safety | Implemented; full automated browser tests still recommended |
| TG-01 | Responsive, CSS-light, keyboard focus, RTL | Built, Lighthouse and manual a11y tests pending |
| TG-02 | GitHub Pages infrastructure | Live TLS/headers/DNS not tested |
| VH-09 | Only name, email, interest and consent required; phone optional | Implemented; conversion experiment remains untested |
| BF-07 | Kasra Pahlavani added as co-founder | Implemented; credential supplied by audit owner request, biography pending |
| BF-06 | A-to-B diagram now shows method rather than oversized logo | Implemented |
| UX-01 | Persian homepage scroll cue states scrolling explicitly | Implemented |
| UX-02 | Accessible back-to-top control | Implemented |

## Non-negotiable prelaunch checks

- Deploy the backend while signed into `vellumhouse.edu@gmail.com`, then enter the generated `/exec` URL in `assets/config.js`.
- Test real successful and failed enquiry submissions; inspect the Sheet, notification inbox, applicant acknowledgement and Cal.com booking.
- Confirm the calendar event is free, uses the right time zone and parent attendance expectations are stated.
- Confirm consent, access restrictions, data retention, response workflow, cancellation policies and safeguarding review.
- Add real photos, videos and documented case studies only when permissioned; until then the media slots intentionally show empty black frames.
- Perform mobile and desktop audits, Core Web Vitals, Persian RTL and keyboard/screen reader testing on production.
