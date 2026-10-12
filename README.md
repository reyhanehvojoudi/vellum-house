# Vellum House — complete bilingual website

A static, GitHub Pages-ready site with 18 English/Persian pages, full RTL layout, mobile navigation, local fonts, a brochure download and an honest enquiry preparation flow. No npm install, framework, API key or build step is needed for publishing.

## Publish on GitHub Pages
1. Extract this ZIP on your computer.
2. Create a repository for the Vellum House site (or open the repository you intend to use).
3. Upload the **contents** of the extracted website folder to the repository root. `index.html`, `fa.html` and the `assets` folder must be at the top level. Do not upload only the ZIP, and do not place the whole site inside an extra parent folder.
4. In the repository's **Settings → Pages**, select **Deploy from a branch** as the source.
5. Choose the branch containing your files, normally `main`, and select **/(root)**. Save.
6. Wait for GitHub's Pages deployment to complete, then open the URL shown there. A project repository normally appears at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
7. Test both `index.html` and `fa.html` at the published URL. Check the mobile menu, brochure, language switch, enquiry summary and external consultation route.

The `.nojekyll` file is included to serve the static files without Jekyll processing. Relative links support both a repository subpath and a custom domain. GitHub Pages availability depends on repository visibility and your GitHub plan. For a custom domain, configure the domain and DNS only once you have chosen the final address; this package does not change your existing domain.

Official publishing-source documentation:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Start pages
- English: `index.html`
- Persian: `fa.html`

Double-click either page for a basic local preview. For a local HTTP preview, run `python3 -m http.server 8000` from this folder and open http://localhost:8000. Clipboard permissions vary locally; a manual-copy fallback is provided.

## What is ready
- Nine complete page types in each language; real HTML content, not JavaScript-only rendering.
- Natural Persian copy, proper language/direction attributes and an equivalent-page language switch.
- Navy/ivory/gold design with the supplied brand image and original brochure.
- Responsive layouts, accessible labels, keyboard navigation, reduced-motion support and a collapsible mobile menu.
- Consultation preparation, copy-to-clipboard with fallback and a working external contact link.
- FAQs, privacy/terms framework and explicitly labeled missing-content sections.
- SEO titles, descriptions and relative language alternates. A final-domain helper is included for canonical URLs, absolute language alternates, social image URLs and sitemap generation.

## Important contact behaviour
**The form prepares text; it does not send, store or book anything.** Visitors copy the result and send it through the existing consultation route. This is explained on both language pages. Direct submission requires a separately configured backend or form provider.

For an email-draft alternative, put your real business inbox in `assets/config.js` → `contactEmail`. Leave it empty to retain the existing consultation-page flow. Do not put API keys, passwords or private information in website files: the repository/site contents are public.

## Edit the website
All page copy is in `content.json`, organised under `en` and `fa`. After changes, run:

```sh
python3 tools/build.py
python3 tools/check.py
```

Publishing does **not** require Python; all generated pages are already included. Python is only a convenience for editing all pages consistently. You can edit individual HTML files instead, but a future rebuild will overwrite those manual edits.

See `docs/CONTENT_CHECKLIST.md` for exact content locations and pending items, `docs/WEBSITE_STRATEGY.md` for the business and website plan, and `docs/START_HERE_FA.md` for Persian instructions.

## Final-domain metadata (optional)
After choosing the public URL, run the command below with your real base URL, including the repository name when relevant:

```sh
python3 tools/set_domain.py https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

This updates canonical/social/language metadata and creates sitemap.xml and robots.txt. It does not purchase a domain, configure DNS or alter GitHub settings. Run it again after any build.py rebuild. No fictional canonical domain is embedded by default.

## Assets and licences
- Brand image and brochure supplied by the owner; original brochure retained unchanged.
- Vazirmatn Regular and Bold are bundled under the SIL Open Font License; see `assets/Vazirmatn-LICENSE.txt`. Source: https://github.com/rastikerdar/vazirmatn.
- All remaining layout/code is included for your editing and use.

## Verification
Run `python3 tools/check.py` for static checks. JavaScript syntax was also checked with Node. Browser rendering and live form/contact navigation have not been exercised in this environment; check them on desktop and a phone after publishing. There is no backend, account system, payment system or appointment scheduler in this static package.
