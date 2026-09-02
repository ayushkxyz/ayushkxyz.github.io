# Ayush Katiyar — portfolio site

Static site. No build step, no dependencies, no server-side code. Upload the files and it runs.

## Files

| File | What it is |
|---|---|
| `index.html` | Home page — hero, stat band, three project cards, about, contact |
| `payment-gateway.html` | Case study — Payment Gateway & Ledger Service |
| `ai-platform.html` | Case study — Distributed AI App-Builder Platform |
| `booking-engine.html` | Case study — Hotel Booking & Dynamic Pricing |
| `styles.css` | All styling, shared by every page |
| `app.js` | Scroll reveal, diagram animation, state machine, copy-to-clipboard |
| `Ayush_Katiyar_Resume.pdf` | Linked from the nav, hero and contact table |

All seven files must sit in the **same folder**. The pages reference each other by plain
filename (`href="payment-gateway.html"`), so any subfolder will break the links.

## Deploying on GitHub Pages

1. Create a repository named `ayushkxyz.github.io` — that exact name gives you a clean URL
   with no `/repo-name` suffix.
2. Upload all seven files to the repository root.
3. Go to **Settings → Pages**. Under *Source*, choose the `main` branch and the `/ (root)`
   folder. Save.
4. Wait about a minute. The site is live at `https://ayushkxyz.github.io`.

## Deploying on Netlify

Drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop). You get a URL
immediately; rename the site under *Site settings* to something like
`ayush-katiyar.netlify.app`.

## Deploying on Vercel

Import the GitHub repo at [vercel.com/new](https://vercel.com/new). Framework preset:
**Other**. Leave the build command empty and the output directory as the root.

## Things to update before you publish

- **The resume PDF summary** still reads "Targeting SDE-1/SDE-2 Backend roles". The site now
  says SDE-1 only. Fix the line in your LaTeX source and replace
  `Ayush_Katiyar_Resume.pdf` so the two agree.
- **Your LinkedIn slug.** Every page links to `linkedin.com/in/ayush-katiyar`. Open it and
  confirm it resolves to your profile — that slug is a common one.
- **GitHub repo links.** The case studies describe each project but don't link to source. If
  the repos are public, adding a link in each spec bar is the single highest-value addition
  to this site.
- **Read the case studies out loud.** They extend your resume bullets into design reasoning
  (why pessimistic locking over optimistic, why hourly recomputation over per-request).
  It's all defensible from what you built, but every sentence should be something you'd
  happily defend in an interview.

## Editing notes

- Colours live in the `:root` block at the top of `styles.css`. `--blue` is the accent used
  for buttons, links and diagram highlights; `--navy` is every heading. Changing those two
  variables re-themes the whole site.
- All animation is gated behind `html.anim`, a class added by a small inline script in each
  page's `<head>` that only fires when the visitor has **not** enabled reduced motion. To
  strip animation entirely, delete that script tag from all four pages.
- The diagrams are hand-written inline SVG inside `<figure class="figure">`. `app.js` finds
  them automatically, fades in the boxes, then draws the connecting edges. No configuration
  needed if you add another one.
