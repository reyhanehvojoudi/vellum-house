# Performance report — Royal Academia build
Measured locally from actual media files, not from prior reports. Source ZIP: Vellum-House-The-Thread.zip.

| Media | Original bytes | New bytes | Dimensions | Duration | Reduction |
|---|---:|---:|---|---:|---:|
| Desktop | 7,560,247 | 2,976,267 | 1280 × 704 | 48.000 s | 60.6% |
| Mobile | 3,768,950 | 1,479,370 | 800 × 440 | 48.000 s | 60.8% |

H.264 MP4, faststart, silent, 20:11 aspect ratio; full source timeline retained. Mobile derived from desktop source to avoid double transcoding of mobile derivative. Original camera master not present. Thirteen sampled frames at 0–47 s compared against supplied desktop derivative using grayscale SSIM (mobile reference resized): desktop mean 0.9450, min 0.9024; mobile mean 0.9235, min 0.8677. These are sampled fidelity metrics, not VMAF and not a substitute for owner playback review.

Poster and logo retained and preloaded. No blocking video preload; automatic playback begins after language selection and visibility; manual playback bypasses auto bandwidth restrictions. Only one derivative selected based on viewport. Booking module loads when needed rather than eager prefetch. Old Thread CSS no longer loaded; old headline preload removed. All shipped fonts are local fallbacks until approved font files installed. No added external runtime dependencies.

LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1, Lighthouse ≥90 and initial resources ≤350 KB are targets only. Browser navigation was blocked by policy (file and localhost net::ERR_BLOCKED_BY_ADMINISTRATOR). No genuine lab timings, waterfall, browser playback verification, field INP or Lighthouse score could be collected. Do not interpret this report as verified live performance. Run local browser tests and PageSpeed Insights after review/deploy. Compare cold and warm cache, Slow 4G, mobile and desktop. Do not confuse Total Blocking Time with INP.
