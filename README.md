<!--
AincFh — frontend and edge developer, Xiamen, China.

Everything on this profile is rendered as SVG. The text below is kept for
search engines, screen readers and anyone reading the raw file.

A.T. FIELD — aincfh.dpdns.org
A content platform I own end to end, from the schema to the DNS record.
Frontend: React Router v7, TypeScript, Tailwind v4, Framer Motion.
Edge: Cloudflare Workers, D1, R2, KV.
Content: Notion as CMS, cached in KV behind a 5-minute TTL.
Mobile: 13 runtime guards that strip weight on slow connections.
Cost: 0 CNY per month, in production.

Three problems from this build I can still explain from memory:
- bcrypt does not exist on Workers. The V8 edge runtime has no Node crypto
  bindings, so password hashing was rewritten on Web Crypto (PBKDF2 with a
  per-user salt).
- Double-charging under concurrent callbacks. Payment confirmation was not
  idempotent. Fixed with a lock acquired before any state mutation, keyed on
  the order id.
- Fine locally, slow in production. The article table needed composite indexes
  across publish date, category and status. Local SQLite hid the cost; D1 did not.

SAINT LAURENT SYSTEMS
Eight-plus internal tools for a community's public-service departments. Zero
dependencies, plain HTML/CSS/JS, one file each, fully functional offline.
- A legal code browser over 24 chapters and 345 provisions, with mixed Chinese
  and pinyin-initial search, space for AND, pipe for OR.
- A sentencing calculator: six reduction tiers, fine-to-time conversion and
  stacked caps.
- A shared frontend template reused across departments, inherited at v2.0.2 and
  carried to v4.59.
These were built for Saint Laurent 2.0, an online roleplay community where I run
the justice department. The systems are real software; the institution they
serve is fictional.

HOW I WORK
I use AI heavily to write code. What I own is the part that does not
autocomplete: choosing D1 over a hosted database because the free tier and edge
locality actually matter, deciding what ships, and debugging production when it
breaks at 2am. I am nineteen, I came into this from art and design, and my weak
spot is depth in the layer underneath what I build. I know exactly where those
gaps are — closing them is why I want to be on a team.

CONTACT
Site: https://aincfh.dpdns.org
Email: fhainc@hotmail.com
Bilibili: https://space.bilibili.com/527018775
-->

<a href="https://aincfh.dpdns.org"><img src="./assets/header.svg" width="100%" alt="AincFh — A.T. Field. Frontend and edge developer based in Xiamen, China." /></a>

<img src="./assets/profile-panel.svg" width="100%" alt="AincFh — frontend and full-stack developer, moved into engineering from art and design. Available for work, open to remote, UTC+8, 0 CNY per month infrastructure cost. Stack: React, TypeScript, Tailwind v4, Framer Motion, Vite, React Router, Cloudflare Workers, D1, R2, KV, Wrangler, Node.js." />

<a href="https://aincfh.dpdns.org"><img src="./assets/work.svg" width="100%" alt="Selected work. 01 A.T. Field at aincfh.dpdns.org — React Router v7, TypeScript, Tailwind v4, Cloudflare Workers, D1, R2, KV, Notion as CMS behind a 5-minute KV TTL, 13 mobile runtime guards, 0 CNY per month in production. Three problems solved: bcrypt does not exist on Workers so hashing was rewritten on Web Crypto PBKDF2; double-charging under concurrent callbacks fixed with an order-id lock; composite indexes across publish date, category and status. 02 Saint Laurent Systems — eight-plus zero-dependency single-file internal tools, a legal code browser over 24 chapters and 345 provisions with pinyin-initial search, and a sentencing calculator. Built for Saint Laurent 2.0, an online roleplay community; the systems are real software, the institution they serve is fictional." />

<img src="./assets/ethos.svg" width="100%" alt="How I work. I use AI heavily to write code; what I own is the part that does not autocomplete — technical choices, what ships, and production debugging. Principles: dark mode is the build target, no package if the platform already does it, everything must survive airplane mode." />

<img src="./assets/footer.svg" width="100%" alt="Destruction is the joy of rebirth. I alone level up. Contact: aincfh.dpdns.org, fhainc@hotmail.com, space.bilibili.com/527018775. AI-augmented, human-reviewed. Made in Xiamen, CN." />
