# Revision 2 — media and performance

| Asset | Source | Delivered | Duration | Dimensions delivered |
|---|---:|---:|---:|---|
| New portrait film | 8,700,080 bytes | 1,465,819 bytes | 24.033333 s | 540 × 960 |
| Existing desktop film | 2,976,000 bytes approx. | Unchanged, byte-identical | 48 s | 1280 × 704 |

Portrait film reduced by 83.2%, encoded H.264 faststart with original 9:16 proportions and complete duration. Source has no separate audio stream. Portrait poster is approximately 13 KB. Replaced obsolete landscape mobile asset in release tree. Desktop media is not recompressed. Portrait and desktop video are selected responsively; poster loads first. Full-screen background cover may crop edges slightly at different aspect ratios. Blur is CSS, not baked into the encoded video. No extra animation framework added.

The selected licensed Dana and English fonts remain uninstalled; existing fallbacks and installer are retained. Actual startup, motion smoothness, LCP, CLS, INP and Lighthouse are not measured. Chromium navigation returned ERR_BLOCKED_BY_ADMINISTRATOR in this environment. Test on your actual phone and desktop before production. No performance scores are claimed.
