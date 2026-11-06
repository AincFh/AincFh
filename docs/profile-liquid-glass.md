# AincFh GitHub Profile — Editorial Liquid Glass v25

## Design provenance

Original SVG UI illustration inspired by Apple Human Interface Guidelines and its updated Liquid Glass vocabulary:
- [Apple: Liquid Glass materials](https://developer.apple.com/design/human-interface-guidelines/materials) — translucent control/navigation layer over **legible, stable content**, sparing use of glass, dimming and readability.
- [Apple: unified 2025 design / iOS 26](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) — context-sensitive refraction, specular highlights, depth.
- [Apple: WWDC26 Platforms State of the Union](https://developer.apple.com/videos/play/wwdc2026/102/) — 27-release improvements: diffusion of complex backgrounds, stronger rim and specular edge, user-adjustable tinted glass.
- [Apple: WWDC26 release overview](https://www.apple.com/newsroom/2026/06/apple-unveils-next-generation-of-apple-intelligence-siri-ai-and-more/) — updated material preferences and clearer sidebar/toolbars.
- [dpawlikowski/liquid-glass](https://github.com/dpawlikowski/liquid-glass) and [nikdelvin/liquid-glass](https://github.com/nikdelvin/liquid-glass) — publicly documented browser-tech feasibility references; no code, images, icons or textures copied into this portfolio.

This is **not** Apple UI, a native Liquid Glass renderer, or a pixel-exact clone. In a GitHub README, each SVG loads via an `<img>`: we render self-contained gradients, bounded displacement and optical edge highlights with CSS fallbacks. Translucency is limited to window/tool controls and small preview surfaces; ordinary text and app content remain opaque, with high-contrast backgrounds. No JavaScript, external fonts, CDN, Apple proprietary images, or remote filters.

## Truth-in-content cross-check

| Visible project | Public verification | Status language |
| --- | --- | --- |
| A.T. Field | [my-anime-blog](https://github.com/AincFh/my-anime-blog); [website](https://aincfh.dpdns.org) | Deployed content/community platform; React Router SSR, TypeScript, Cloudflare Workers/D1/KV/R2 |
| Saint Laurent | [public portal](https://yslfivem.com); nonpublic engineering records | Real community platform but **fictional** FiveM institutions; private core code; public codex and KOOK integration. Candidate or unverified features are not represented as published |
| ATLAS Developer Studio | [dev-control-center](https://github.com/AincFh/dev-control-center) | Public multi-domain R&D workspace, data/image/API browser tools; outside GitHub references never counted as authored products |
| QingJi | [QingJi](https://github.com/AincFh/QingJi) | Native Kotlin / Compose / SQLite Android **prototype** with local budget and CSV export; Debug APK is not an App Store/Play Store release or proof of real-device acceptance |
| Windows Tools | nonpublic projects and public background documentation | C#/.NET/WinForms/WebView2; don't link or expose private code, credential material or unverified releases |
| Meridian Toolkit | [meridian-toolkit](https://github.com/AincFh/meridian-toolkit) | Public browser-based offline developer utilities; eight real tools, not a desktop EXE |
| AincFh OS | [open `docs/` source](https://github.com/AincFh/AincFh/tree/main/docs) | Browser-sandbox desktop simulation, not an actual host OS or hardware control tool |

Cross-check sources consulted during copy revision include the linked project repositories, AincFh project history, and Notion project-status notes. **No personal résumé details, private Notion URLs, secrets, private source URLs, player details, financial data or unverified current metrics are embedded in public SVGs.** Notion may describe unfinished or local-only status; avoid promoting those statements to released status without repository/release evidence.

## Rendering, accessibility and maintenance

- All five files share the same glass tokens and light/dark adaptation; glass tint, border and rim change together.
- `prefers-reduced-motion: reduce` freezes ambient effects and the four-scene reel at its readable first frame.
- `prefers-contrast: more` falls back to an opaque, high-contrast control background.
- Only the central project explorer uses autonomous content cycling; other movements are intentionally slow and restrained.
- The decorative displacement filter is static, low-scale and must never be applied to live text.
- README images are illustrative marketing UI, not live project screenshots.
- Image ordering and public copy must remain verifiable, and changes require PR plus structural/Chromium QA.
