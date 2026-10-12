# Vellum House — website strategy

## Positioning
Vellum House is an individual academic management service: planning, instruction and guidance working together through school, university and postgraduate study. The supplied brochure is the primary content source. The website retains its considered, personal tone and extends the structure into a usable bilingual experience.

The core promise is coordination and continuity. Avoid unverifiable superlatives such as “first and only”, invented statistics, partner logos, admission guarantees or fabricated testimonials. Present verified achievements with dates and context when available.

## Audience and visitor journeys
| Visitor | Question | Destination | Next action |
|---|---|---|---|
| Parent of a school student | How will you bring the pieces together? | Approach → school pathway | Consultation |
| University applicant | Is the advice tailored to my goals? | University applicant pathway → services | Consultation |
| Undergraduate or graduate student | Is there support beyond school? | University & beyond → services | Consultation |
| Returning visitor | How do I contact you or read more? | Consultation / Resources | Existing enquiry page / brochure |

The website's primary action is requesting a consultation. Downloading the brochure is a secondary action for visitors who need more context. There is no invented booking calendar, price table, limited-capacity message or guaranteed response time.

## Site map
Each page is a complete static HTML document in English and Persian; content is present even when JavaScript is unavailable.

| Section | English | Persian | Purpose |
|---|---|---|---|
| Home | index.html | fa.html | Introduce the proposition, support and pathways |
| Our approach | approach.html | approach-fa.html | Explain the six-stage roadmap and reporting |
| Services | services.html | services-fa.html | Define eight connected areas of support |
| Your pathway | pathways.html | pathways-fa.html | Address school, applicant and university audiences |
| The house | about.html | about-fa.html | Philosophy, values, founder/team slots and future stories |
| Resources | journal.html | journal-fa.html | Downloadable brochure and future editorial categories |
| Consultation | contact.html | contact-fa.html | Guided enquiry preparation, contact route and FAQs |
| Privacy | privacy.html | privacy-fa.html | Explain current data flow and pending operational details |
| Terms | terms.html | terms-fa.html | Set expectations and identify policies to be completed |

## Visual direction
Midnight navy (#0b2232), warm ivory (#f8f5ef), muted gold (#b58946). Large editorial headings, generous spacing, thin rules, restrained geometric accents, and the supplied VH artwork. English uses a classic system serif paired with a clean sans serif. Persian uses self-hosted Vazirmatn in regular and bold, with independent right-to-left layout and natural Persian copy. Fonts and images require no external asset service.

The logo artwork is used as the main brand image; the smaller navigation wordmark is live text. A simple text-based VH favicon is supplied. The brochure is included unchanged. No licensed stock imagery, fictional offices or invented staff portraits are used.

## Consultation conversion
1. Explain fit and scope before asking for details.
2. Offer a short structured brief: name, email, student, relationship, stage and goals; city/time zone, availability and deadline remain optional.
3. Prepare a plain-text summary locally.
4. Let the visitor copy the summary and move to the existing consultation page. The page explicitly states that no message has yet been sent.
5. Optionally set a verified inbox in assets/config.js to open an email draft instead. Email is still sent by the visitor's own mail app.

The current delivery intentionally does not pretend to submit forms, store leads, book meetings or process payments. A direct working link to the existing consultation page is also available without JavaScript. Its availability is controlled by the existing site and was not independently exercised in this build.

## Content completion priorities
Before announcing the site widely, review the highlighted items in CONTENT_CHECKLIST.md. Give particular attention to business contacts and operational policies. The requested empty sections are visible and honestly labeled, rather than populated with invented evidence.

Publish approved staff information and student stories only with permission. For each case study, capture starting conditions, agreed support, dates, specific progress and appropriate limitations. For younger students, avoid unnecessary identifying details.

## Future growth
- Connect a verified form endpoint with real success/error handling, spam protection and an agreed retention policy if you want submissions directly from this domain.
- Add approved biographies and educator specialisms before expanding claims about team capacity.
- Publish a small set of useful guides matching real enquiry questions.
- Add a scheduling link only once consultation duration, price, timezone and cancellation terms are settled.
- Add analytics only after deciding what to measure and updating the privacy information. Useful measures are consultation clicks, enquiry completions and brochure downloads; this version includes no analytics.
- Use a final domain to generate absolute canonical/hreflang URLs, sitemap and social sharing metadata via tools/set_domain.py.

## Validation limits
Static link, anchor, file-reference, language-parity, image-alt and form-label checks are included, along with JavaScript syntax checks. Live browser/device rendering, the clipboard API and the external consultation service require a manual check after publishing; no browser execution or screenshot validation is claimed.
