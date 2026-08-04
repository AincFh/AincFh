<img src="./assets/header.svg" width="100%" alt="AincFh_OS — Absolute Domain, Deployed" />

<p align="center">
  <a href="https://aincfh.dpdns.org"><img src="https://img.shields.io/badge/A.T._Field-LIVE-007AFF?style=for-the-badge&labelColor=1d1d1f" alt="A.T. Field — live" /></a>
  <img src="https://img.shields.io/badge/Edge-Cloudflare_Workers-FF9500?style=for-the-badge&labelColor=1d1d1f" alt="Runs on Cloudflare Workers" />
  <img src="https://img.shields.io/badge/UI-iOS_Glass-AF52DE?style=for-the-badge&labelColor=1d1d1f" alt="iOS glass interface language" />
  <img src="https://img.shields.io/badge/Infra_Cost-%C2%A50-34C759?style=for-the-badge&labelColor=1d1d1f" alt="Zero infrastructure cost" />
</p>

<img src="./assets/profile-panel.svg" width="100%" alt="AincFh — Frontend and Full-stack Developer, Xiamen, China" />

## ▍A.T. Field / 絶対領域

A content platform I own end to end — from the schema to the DNS record.

| | |
| :-- | :-- |
| **Live** | **[aincfh.dpdns.org](https://aincfh.dpdns.org)** |
| **Frontend** | React Router v7 · TypeScript · Tailwind v4 · Framer Motion |
| **Edge** | Cloudflare Workers · D1 · R2 · KV |
| **Content** | Notion as CMS, cached in KV behind a 5-minute TTL |
| **Mobile** | 13 runtime guards that strip weight on slow connections |
| **Cost** | ¥0 / month, in production |

Three problems from this build that I can still explain from memory:

- **`bcrypt` does not exist on Workers.** The V8 edge runtime has no Node crypto bindings, so password hashing was rewritten on Web Crypto — PBKDF2 with a per-user salt.
- **Double-charging under concurrent callbacks.** Payment confirmation was not idempotent. Fixed with a lock acquired before any state mutation, keyed on the order id.
- **Queries that were fine locally and slow in production.** The article table needed composite indexes across publish date, category, and status. Local SQLite hid the cost; D1 did not.

## ▍Single-File Systems

Eight-plus internal tools for a community's public-service departments. Zero dependencies, plain HTML/CSS/JS, one file each, fully functional offline.

- A legal code browser over **24 chapters and 345 provisions**, with mixed Chinese and pinyin-initial search, space for `AND`, pipe for `OR`
- A sentencing calculator: six reduction tiers, fine-to-time conversion, and stacked caps
- A shared frontend template reused across departments — I inherited it at v2.0.2 and have carried it to v4.59

> These were built for **Saint Laurent 2.0**, an online roleplay community where I run the justice department. The systems are real software; the institution they serve is fictional.

## ▍How I Work

I use AI heavily to write code. What I own is the part that does not autocomplete: choosing D1 over a hosted database because the free tier and edge locality actually matter, deciding what ships, and debugging production when it breaks at 2am.

I am nineteen, I came into this from art and design, and my weak spot is depth in the layer underneath what I build. I know exactly where those gaps are — closing them is why I want to be on a team.

## ▍Elsewhere

<p align="center">
  <a href="https://aincfh.dpdns.org"><img src="https://img.shields.io/badge/Site-aincfh.dpdns.org-007AFF?style=flat-square&labelColor=1d1d1f" alt="Website" /></a>
  <a href="mailto:fhainc@hotmail.com"><img src="https://img.shields.io/badge/Email-fhainc@hotmail.com-8E8E93?style=flat-square&labelColor=1d1d1f" alt="Email" /></a>
  <a href="https://space.bilibili.com/527018775"><img src="https://img.shields.io/badge/Bilibili-527018775-FB7299?style=flat-square&labelColor=1d1d1f" alt="Bilibili" /></a>
</p>

<p align="center">
  <sub><b>破灭的宿命亦是重生的喜悦</b></sub><br />
  <sub>Destruction is the joy of rebirth.</sub><br />
  <sub><i>I alone level up. (Arise)</i></sub>
</p>

<img src="./assets/footer.svg" width="100%" alt="AincFh_OS — end of line" />
