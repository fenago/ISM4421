# Owl Weather — ISM 4421

An FAU-branded weather app that defaults to the **Boca Raton campus**. Weather and city search come from the free [Open-Meteo](https://open-meteo.com/) APIs, which need no account or API key.

## Features
- Current conditions: temperature, feels-like, humidity, wind and gusts, UV index, rain chance, sunrise and sunset
- Hourly forecast for the next 24 hours and a 7-day forecast
- City search (Open-Meteo geocoding) with keyboard navigation
- One-click buttons for every FAU campus: Boca Raton, Jupiter, Davie, Fort Lauderdale, Dania Beach (SeaTech), Harbor Branch
- "My location" button (browser geolocation)
- °F / °C toggle. The last place and unit you picked are remembered.
- Glass design with two looks: daylight glass (Light) and night glass (Dark), plus System, which follows your device's setting. Your choice is remembered.
- A personal welcome for Dr. Lee with a quick weather summary and tips (umbrella, heat, UV, storms)
- Stat tiles for humidity (with dew point), wind, gusts (with the strongest hour), UV, rain chance (with when rain is likely), and sunrise/sunset
- FAU owl logo and FAU Blue accents; the layout adapts from desktop to phone

## Project layout
```
public/            # the site Netlify publishes
  index.html
  styles.css
  app.js
  icons.js         # the Lucide icons the UI uses (ISC license), built as DOM nodes
  theme-init.js
  assets/fau-mark.svg   # fallback logo
scripts/fetch-fau-logo.sh  # downloads the official FAU owl logo at build time
tests/security.test.js     # OWASP security regression test (optional, needs Playwright)
netlify.toml       # build settings plus security and cache headers
```
It's plain HTML, CSS and JavaScript. There's no framework and no `npm install`.

## Deploy to Netlify

### Option A: connect the GitHub repo (recommended)
1. In Netlify, choose **Add new site → Import an existing project → GitHub** and pick `fenago/ISM4421`.
2. Netlify reads `netlify.toml` on its own: the publish directory is `public` and the build command is `sh scripts/fetch-fau-logo.sh`. Leave the form fields as they are.
3. Click **Deploy**. Every push to the branch you chose redeploys the site.

### Option B: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
sh scripts/fetch-fau-logo.sh     # pulls the official FAU logo into public/assets
netlify deploy --prod --dir=public
```

### Option C: drag and drop
Run `sh scripts/fetch-fau-logo.sh` once, then drag the `public/` folder onto https://app.netlify.com/drop.

## About the FAU logo
The build step downloads FAU's official owl-head logo from `https://www.fau.edu/images/homepage/owlhead-logo.png` into `public/assets/fau-owl.png`. If that download fails, the page shows the bundled `fau-mark.svg` instead, so a deploy never breaks. To use a different official asset, save it as `public/assets/fau-owl.png`. Use of FAU marks falls under FAU's brand guidelines.

## Run locally
```bash
sh scripts/fetch-fau-logo.sh   # optional
cd public && python3 -m http.server 8080
# open http://localhost:8080
```

## Security (OWASP Top 10)
The app was audited against the OWASP Top 10 (2021). It is a static site with no server code, accounts, or stored personal data, so access control, authentication, and SSRF (A01, A07, A10) don't apply. What's in place for the rest:

| OWASP risk | Controls |
|---|---|
| A02 Cryptographic failures | HTTPS enforced with HSTS and `upgrade-insecure-requests`. All API calls use HTTPS. |
| A03 Injection (XSS) | No API, search, or saved data is ever parsed as HTML; it's all written with `textContent`. The app never parses HTML at all (icons are built as DOM nodes), and the CSP enforces **Trusted Types** with no policy allowed. No inline scripts or styles, and no `eval`. |
| A04 Insecure design | Location is rounded to about 1 km before it's sent or saved. No cookies or referrer go to the API. Search length is capped and requests time out after 10 s. |
| A05 Security misconfiguration | A strict CSP (`default-src 'none'`, `frame-ancestors 'none'`, `object-src 'none'`), plus HSTS, X-Frame-Options, nosniff, `Referrer-Policy: no-referrer`, a locked-down Permissions-Policy, COOP and CORP. A matching `<meta>` CSP covers hosts that don't send `netlify.toml`'s headers. |
| A06 Vulnerable components | No third-party code, CSS, or fonts at runtime. The few icons used are copied into `icons.js`, and there are no npm dependencies. |
| A08 Software & data integrity | API responses and `localStorage` are schema-checked before use; bad data falls back to defaults. The build only publishes the downloaded logo if it's a real PNG under 2 MB, fetched over HTTPS. |
| A09 Logging & monitoring | Errors are logged to the browser console without personal data. The user sees a generic message. |

Run the regression test (it serves the site with the production headers, mocks the APIs with malicious data, and checks that nothing is injected):
```bash
npm install -g playwright && npx playwright install chromium   # once
node tests/security.test.js
```
If you change the CSP, update it in both `netlify.toml` and the `<meta>` tag in `public/index.html`.

## Data attribution
Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under CC BY 4.0. The free tier is for non-commercial use.
