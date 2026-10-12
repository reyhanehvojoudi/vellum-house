# Content to complete

All missing-content areas are already designed. The public site labels pending content in both languages.

| Priority | Item | Location / keys in content.json |
|---|---|---|
| Before wider launch | Verified business email or preferred contact route | assets/config.js; contact copy in both languages |
| Before offering paid bookings | Consultation fee, duration, scheduling process | pricingText, faq, terms |
| Before collecting information directly | Responsible business contact, data retention and applicable policies | privacy, terms, policyNote |
| Before signing clients | Cancellation/refund, safeguarding and service agreements | terms and separate operational documents |
| High | Approved founder portrait and full biography | founder; about template in tools/build.py |
| High | Educator/mentor names, credentials, languages and availability | mentors |
| High | Team contact responsibilities | operations |
| When available | Permission-based student case studies | storySlot, storiesText |
| When available | Approved testimonials with attribution | quoteSlot |
| When ready | Real published guides | articles; update journal template to link to new article pages |
| Once selected | Final public domain/repository URL | tools/set_domain.py |
| Optional | Official social accounts | Add verified URLs to footer template; no guessed accounts are included |

Do not publish a student's personal details without permission. Replace each “content to be added” badge only after its content is verified. No test scores, results, quotes or client counts were invented.

## Where to edit
- Text: content.json → en / fa → the relevant key.
- Page structure: tools/build.py.
- Colour, spacing, typography and breakpoints: assets/style.css.
- Contact configuration: assets/config.js.
- Logo artwork: assets/vh-brand.webp (maintain a square aspect ratio, or change associated image dimensions).
- Brochure: assets/Vellum_House_Brochure.pdf.
- After editing content.json or the page template, run `python3 tools/build.py`, then `python3 tools/check.py`.
- If a final domain was configured earlier, rerun tools/set_domain.py after rebuilding, because rebuilt pages will otherwise lose their absolute SEO metadata.
- If you prefer no tooling, edit the HTML pages directly. Later rebuilding overwrites those manual HTML edits.
