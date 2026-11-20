# Editing V8's content without redesigning the site

All visible English and Persian editorial copy lives in the `D.fa` and `D.en` translation objects near the beginning of `assets/experience.js`.

## Founders and team
- `person1`, `person1role`, `person1detail`: Reyhaneh Vojoudi
- `person2`, `person2role`, `person2detail`: Kasra Pahlavani
- `teamTitle`, `teamText`: specialist network area

For an authorised professional photo, place a **compressed image you own or have rights to use** in `assets`, then add CSS for the slot, for example:

```css
.portrait-slot[data-slot="founder-one"] {
  background: url('founder-reyhaneh.webp') center 28%/cover no-repeat;
}
.portrait-slot[data-slot="founder-one"] .portrait-geometry,
.portrait-slot[data-slot="founder-one"] .portrait-placeholder { display:none; }
```

Do the same for `founder-two` when its photo is ready. For the specialist team, edit the `teamText` copy or replace the team strip with verified profiles. Never manufacture credentials.

## Results and testimonials
- `resultHead`, `resultText`: reserved verified student outcomes.
- `quoteHead`, `quoteText`: reserved real, consented family comments.
- `slot` and `proofFoot`: currently indicate content pending verification.

Replace only after confirming authenticity and obtaining any required consent, particularly when involving minors. Do not publish student names, faces or outcomes without permission.

## Headline, CTA and navigation
- Headline: `hero`; short parent-friendly explanation: `heroSub`.
- Persian CTA is **exactly** `درخواست جلسه مشاوره رایگان اولیه` and English CTA is `Book a Free Initial Consultation`. Keep consistent.
- Avoid unexplained abbreviations such as IGCSE, A Level and IB. If introduced, explain them plainly at first mention.
- Booking destination and Sheets endpoint are in `assets/config.js`, not in editorial text.

## Legal notices
- `privacyTitle`, `privacyCopy`, `termsTitle`, `termsCopy`, `legalFoot` are currently concise drafting placeholders. These should be reviewed for the organisation's actual data and service policy before launch.

## Accessibility and sizing
The page is composed for one viewport. Test your edits at 320×640, 390×844 and 1440×900, especially if adding longer texts. On compact phones, the consultation switches into two small screens instead of a long scrolling form.
